/**
 * Mock data for frontend development.
 * Used when backend is disabled so pages have realistic content.
 */

export const MOCK_TASKS = [
  {
    _id: 'mock-1',
    type: 'task',
    title: 'Write LinkedIn post',
    status: 'todo',
    priority: 'high',
    dueDate: new Date().toISOString(),
    estimatedEffort: 2,
    listId: null,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-2',
    type: 'task',
    title: 'Review PRs',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date().toISOString(),
    estimatedEffort: 1,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-3',
    type: 'task',
    title: 'Gym workout',
    status: 'todo',
    priority: 'low',
    isHabit: true,
    streakCurrent: 5,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-4',
    type: 'task',
    title: 'Read 30 pages',
    status: 'todo',
    priority: 'medium',
    isHabit: true,
    habitGoalType: 'count' as const,
    habitTarget: 30,
    streakCurrent: 12,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'mock-5',
    type: 'task',
    title: 'Plan Q3 roadmap',
    status: 'backlog',
    priority: 'high',
    estimatedEffort: 4,
    createdAt: new Date().toISOString(),
  },
]
