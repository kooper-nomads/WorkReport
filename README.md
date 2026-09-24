# Worksection Task Report

Звіт по задачах Worksection: для обраних користувачів і періоду показує дошку з колонками To Do / In Progress / Done.

- `frontend/` — React 19 + Vite + TypeScript, TanStack Query
- `backend/` — NestJS + TypeScript, Prisma + PostgreSQL

## Зміст

1. [Швидкий старт (Docker Compose)](#швидкий-старт-docker-compose)
2. [Налаштування](#налаштування)
3. [Запуск без Docker](#запуск-без-docker)
4. [Робота з проєктом](#робота-з-проєктом)

## Швидкий старт (Docker Compose)

Потрібні Docker з Compose v2 і доступ до акаунту Worksection: API-ключ або OAuth-застосунок (див. [Налаштування](#налаштування)).

```bash
cp .env.example .env                  # перемикачі авторизації та BACKEND_PUBLIC_URL
cp backend/.env.example backend/.env  # секрети: API key та/або OAuth client
# заповни backend/.env

docker compose up --build
docker compose exec backend npx prisma migrate deploy   # у другому терміналі
```

| Сервіс | Адреса |
|---|---|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| PostgreSQL | `localhost:5432`, `user/password/db` = `worksection` |

**Міграції** автоматично не застосовуються. Команду `prisma migrate deploy` треба виконати після першого запуску і після появи нових міграцій у `backend/prisma/migrations`. Без неї OAuth-логін падає, бо немає таблиці `WorksectionConnection`.

Зупинити: `docker compose down`. Дані Postgres лишаються у volume `postgres_data`; `docker compose down -v` видаляє й їх.

## Налаштування

### Де що задається

- **Кореневий `.env`** — читається лише `docker-compose.yml` через `${VAR}`-підстановку. Тут перемикачі `WORKSECTION_AUTH_METHOD`, `AUTH_METHOD` і `BACKEND_PUBLIC_URL`. Під Docker ці значення перекривають однойменні з `backend/.env`.
- **`backend/.env`** — секрети (API-ключ, OAuth client) і все інше. Без Docker бекенд читає тільки цей файл.

### Доступ до Worksection API: `WORKSECTION_AUTH_METHOD`

**`api_key`** (за замовчуванням) — адміністративний API-ключ.

1. У Worksection: аватар → налаштування акаунту → API → показати ключ. Доступно лише власнику акаунту ([довідка](https://worksection.com/ua/faq/api/api-start/1380.html)).
2. У `backend/.env`: `WORKSECTION_ACCOUNT_URL=https://youraccount.worksection.com` і `WORKSECTION_API_KEY=<ключ>`.

**`oauth`** — OAuth 2.0.

1. Зареєструй OAuth-застосунок у налаштуваннях акаунту Worksection (розділ API). Redirect URI: `<BACKEND_PUBLIC_URL>/auth/worksection/callback`, за замовчуванням `http://localhost:3001/auth/worksection/callback`.
2. У `backend/.env`: `WORKSECTION_OAUTH_CLIENT_ID` і `WORKSECTION_OAUTH_CLIENT_SECRET`.
3. Один раз залогінься кнопкою «Увійти через Worksection» у UI або відкрий `http://localhost:3001/auth/worksection/login`.

Після логіну бекенд зберігає **одне спільне підключення на весь застосунок**: усі запити до API йдуть від імені того, хто залогінився. Токени оновлюються автоматично. `POST /auth/logout` відключає застосунок для всіх.

### Логін на платформу: `AUTH_METHOD`

- `off` (за замовчуванням) — звіт видно одразу.
- `worksection_oauth` — поки OAuth-підключення не встановлене, замість звіту показується екран логіну через Worksection. Потрібні налаштування OAuth-застосунку з попереднього пункту, навіть якщо `WORKSECTION_AUTH_METHOD=api_key`.

| `WORKSECTION_AUTH_METHOD` | `AUTH_METHOD` | Результат |
|---|---|---|
| `api_key` | `off` | Без логіну, запити по API-ключу |
| `api_key` | `worksection_oauth` | Логін через Worksection, запити по API-ключу |
| `oauth` | `off` | Без екрана логіну, але OAuth-підключення все одно треба один раз встановити через `/auth/worksection/login` |
| `oauth` | `worksection_oauth` | Логін обов'язковий, запити від імені того, хто залогінився |

### Доступ ззовні: `BACKEND_PUBLIC_URL`

Адреса, за якою бекенд доступний з браузера. З неї формуються `VITE_API_URL` фронтенда і OAuth redirect URI бекенда. Для доступу через тунель (напр. `cloudflared`) достатньо змінити лише її:

```
BACKEND_PUBLIC_URL=https://<random>.trycloudflare.com
```

Той самий URL + `/auth/worksection/callback` треба додати як redirect URI в OAuth-застосунку Worksection. Фронтенд і бекенд мають працювати з одного origin, заданого цим URL, інакше OAuth-логін падає з помилкою «сесію прострочено».

### Усі змінні

| Змінна | Файл | Призначення |
|---|---|---|
| `WORKSECTION_AUTH_METHOD` | `.env` / `backend/.env` | `api_key` \| `oauth` |
| `AUTH_METHOD` | `.env` / `backend/.env` | `off` \| `worksection_oauth` |
| `BACKEND_PUBLIC_URL` | `.env` | Публічна адреса бекенда (лише Docker) |
| `WORKSECTION_ACCOUNT_URL`, `WORKSECTION_API_KEY` | `backend/.env` | Для `api_key` |
| `WORKSECTION_OAUTH_CLIENT_ID`, `WORKSECTION_OAUTH_CLIENT_SECRET` | `backend/.env` | Для OAuth |
| `WORKSECTION_OAUTH_REDIRECT_URI` | `backend/.env` | Лише без Docker; під Docker береться з `BACKEND_PUBLIC_URL` |
| `WORKSECTION_OAUTH_SCOPE` | `backend/.env` | Необов'язково; scopes через пробіл |
| `PORT`, `FRONTEND_URL`, `DATABASE_URL` | `backend/.env` | Порт бекенда, дозволені CORS-origin через кому, PostgreSQL. Під Docker задані в `docker-compose.yml` |

## Запуск без Docker

Потрібні Node.js 24 і власний PostgreSQL.

**Backend:**
```bash
cd backend
npm install
cp .env.example .env        # заповни, зокрема DATABASE_URL
npx prisma migrate deploy
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Кореневий `.env` у цьому режимі не читається. Усі змінні, зокрема `WORKSECTION_AUTH_METHOD`, `AUTH_METHOD` і `WORKSECTION_OAUTH_REDIRECT_URI`, беруться з `backend/.env`.

## Робота з проєктом

### Команди

| Де | Команда | Що робить |
|---|---|---|
| `backend/` | `npm run start:dev` | Dev-сервер з hot reload |
| `backend/` | `npm test` | Unit-тести (Vitest) |
| `backend/` | `npm run test:e2e` | E2E-тести |
| `backend/` | `npm run lint` | Лінтер (oxlint) |
| `backend/` | `npx prisma migrate dev --name <name>` | Нова міграція після зміни `prisma/schema.prisma` |
| `frontend/` | `npm run dev` | Vite dev-сервер |
| `frontend/` | `npm run build` | Type-check і production-збірка |
| `frontend/` | `npm run lint` | ESLint |

Під Docker команди запускаються всередині контейнера, напр. `docker compose exec backend npm test`. Код змонтований як volume, тож зміни підхоплюються без перезбірки. Перезбірка (`docker compose up --build`) потрібна після зміни залежностей або `schema.prisma`.

### Структура

```
frontend/src/
├── api/              # fetch-клієнт, хуки useAuth / useUsers / useTasks
└── components/       # ConnectWorksection, TaskReport, TaskColumn, TaskCard,
                      # UserFilter, PeriodFilter, Spinner
backend/
├── prisma/           # schema.prisma, міграції
└── src/
    ├── auth/                  # /auth/* — OAuth login/callback, status, logout
    ├── tasks/                 # /tasks/* — звіт по задачах, групування за статусними мітками
    ├── users/                 # /users
    ├── webhook/               # /webhooks
    ├── worksection/           # спільні типи, інтерфейс клієнта, винятки
    ├── worksection-api-token/ # клієнт Worksection на API-ключі
    ├── worksection-oauth/     # клієнт Worksection на OAuth, зберігання підключення
    ├── worksection-client/    # вибір клієнта за WORKSECTION_AUTH_METHOD
    ├── rate-limit/            # throttler guard
    └── prisma/                # PrismaService
```

### API бекенда

| Метод | Шлях | Опис |
|---|---|---|
| `GET` | `/users` | Користувачі акаунту Worksection |
| `GET` | `/tasks/by-status?userEmail=&from=&to=` | Задачі, згруповані в `todo` / `in_progress` / `done` |
| `GET` | `/tasks/active?userEmail=` | Відкриті задачі виконавців |
| `GET` | `/tasks/done?userEmail=&from=&to=` | Задачі, закриті в періоді |
| `GET` | `/auth/status` | Режими авторизації і стан OAuth-підключення |
| `GET` | `/auth/worksection/login` | Редірект на сторінку згоди Worksection |
| `GET` | `/auth/worksection/callback` | Обмін `code` на токени, редірект на фронтенд |
| `POST` | `/auth/logout` | Видалення спільного OAuth-підключення |
| `POST` | `/webhooks` | Прийом webhook-ів Worksection (поки лише логування) |

`userEmail` можна передати кілька разів для кількох користувачів. `from`/`to` — Unix timestamp у мілісекундах. Усі ендпоінти, крім `/webhooks`, обмежені до 100 запитів за хвилину з однієї IP-адреси.

### Обмеження поточної конфігурації

- `docker-compose.yml` — лише dev-режим, production-конфігу немає.
- Порти, `env_file` і `FRONTEND_URL` у `docker-compose.yml` зафіксовані, тому другу копію стека (напр. тестове середовище) на тій самій машині без правок compose не запустити.
