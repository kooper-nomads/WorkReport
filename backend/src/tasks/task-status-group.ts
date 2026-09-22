export type TaskStatusGroup = 'todo' | 'in_progress' | 'done';
export const taskStatusTag = ['BACKLOG', 'BRIEF DRAFT', 'BRIEF REVIEW', 'IN QUEUE', 'TO DO', 'IN PROGRESS', 'ON VERIFICATION', 'DESIGN REVIEW', 'QA REVIEW', 'TASK REVIEW', 'FOR APPROVAL', 'APPROVED', 'ON HOLD', 'DEPLOY', 'DEPLOY REVIEW', 'REVIEWED', 'COMPETED'] as const;
export type TaskStatusTag = typeof taskStatusTag[number];

export function isTaskStatusTag(label: string): label is TaskStatusTag {
  return (taskStatusTag as readonly string[]).includes(label);
}

// Worksection status tags grouped per the workspace's own status board (To Do / In Progress /
// Done columns). Keyed by the tag label as it appears in the Worksection UI, upper-cased for
// case-insensitive lookup.
export const STATUS_TAG_GROUP: Record<TaskStatusTag, TaskStatusGroup> = {
  BACKLOG: 'todo',
  'BRIEF DRAFT': 'todo',
  'BRIEF REVIEW': 'todo',
  'IN QUEUE': 'todo',
  'TO DO': 'todo',

  'IN PROGRESS': 'in_progress',
  'ON VERIFICATION': 'in_progress',
  'DESIGN REVIEW': 'in_progress',
  'QA REVIEW': 'in_progress',
  'TASK REVIEW': 'in_progress',
  'FOR APPROVAL': 'in_progress',
  APPROVED: 'in_progress',
  'ON HOLD': 'in_progress',
  DEPLOY: 'in_progress',
  'DEPLOY REVIEW': 'in_progress',
  REVIEWED: 'in_progress',
  
  COMPETED: 'done',
};

/**
 * Classifies a task by its Worksection status tag. Falls back to the task's own `active`/`done`
 * status when the task has no recognized status tag (e.g. it's tagged only with a project tag).
 */
export function resolveTaskStatusGroup(
  statusTag: TaskStatusTag | null,
  fallbackStatus: 'active' | 'done',
): TaskStatusGroup {
  if (statusTag) {
    return STATUS_TAG_GROUP[statusTag];
  }

  return fallbackStatus === 'done' ? 'done' : 'todo';
}
