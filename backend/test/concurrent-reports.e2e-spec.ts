import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../src/app.module.js';
import type { WorksectionTask } from '../src/worksection/worksection.types.js';

// Diagnostic test for the "many users generate a report at once" scenario. Boots the real Nest
// app (real throttler, real WorksectionApiTokenService queue) and only stubs the outbound fetch() to
// Worksection, so we can push concurrency well past what the real 1 req/sec account limit would
// allow in a reasonable test run, while still exercising the real serialization/queue code path.
const CONCURRENT_USERS = 25;
const MOCK_LATENCY_MS = 30;

function emailFor(i: number): string {
  return `user${i}@example.com`;
}

// One active task per simulated user, so a leak between concurrent requests (a user seeing
// another user's task) would show up as an unexpected assignee name in that user's response.
function buildAllTasks(): WorksectionTask[] {
  return Array.from({ length: CONCURRENT_USERS }, (_, i) => ({
    id: i + 1,
    name: `Task for ${emailFor(i)}`,
    status: 'active',
    page: '',
    priority: 'normal',
    user_from: { id: 1, email: 'author@example.com', name: 'Author' },
    user_to: { id: i + 1, email: emailFor(i), name: emailFor(i) },
    project: { id: 1, name: 'Project', page: '' },
    date_added: new Date().toISOString(),
  }));
}

describe('Concurrent report generation (GET /tasks/by-status)', () => {
  let app: INestApplication<App>;
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let calls: string[] = [];

  beforeEach(async () => {
    process.env.WORKSECTION_ACCOUNT_URL = 'https://example.worksection.com';
    process.env.WORKSECTION_API_KEY = 'test-key';
    calls = [];

    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = new URL(String(input));
      const action = url.searchParams.get('action') ?? 'unknown';
      calls.push(action);
      await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

      // get_all_tasks (findActive) returns the fixed active-task set; search_tasks (findDone)
      // returns none, so each user's report should contain exactly their one active task.
      const data = action === 'get_all_tasks' ? buildAllTasks() : [];

      return new Response(JSON.stringify({ status: 'ok', data }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    fetchSpy.mockRestore();
  });

  it(
    `serves ${CONCURRENT_USERS} concurrent report requests without crashing or mixing up data`,
    async () => {
      const from = Math.floor(Date.now() / 1000) - 86400;
      const to = Math.floor(Date.now() / 1000) + 86400;

      const start = Date.now();
      const responses = await Promise.all(
        Array.from({ length: CONCURRENT_USERS }, (_, i) =>
          request(app.getHttpServer()).get('/tasks/by-status').query({ userEmail: emailFor(i), from, to }),
        ),
      );
      const elapsedMs = Date.now() - start;

      responses.forEach((res, i) => {
        expect(res.status).toBe(200);
        const allTasks = [...res.body.todo, ...res.body.in_progress, ...res.body.done];
        expect(allTasks).toHaveLength(1);
        expect(allTasks[0].assignee.name).toBe(emailFor(i));
      });

      // 2 Worksection calls per user (active + done), all serialized ≥MIN_REQUEST_INTERVAL_MS apart.
      expect(calls).toHaveLength(CONCURRENT_USERS * 2);

      console.log(
        `[concurrent-reports] ${CONCURRENT_USERS} concurrent report requests -> ` +
          `${calls.length} serialized Worksection calls, elapsed ${elapsedMs}ms`,
      );
    },
    // Real queue enforces ≥1s between the CONCURRENT_USERS*2 outbound calls, so this genuinely
    // takes tens of seconds — generous timeout to match.
    120_000,
  );
});
