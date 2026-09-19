import type { Task } from '../types/task'

const oleh = { id: 'u1', name: 'Олег Іваненко' }
const kateryna = { id: 'u2', name: 'Катерина Бойко' }
const andrii = { id: 'u3', name: 'Андрій Мельник' }
const sofia = { id: 'u4', name: 'Софія Ткаченко' }

export const mockTasks: Task[] = [
  {
    id: 101,
    name: 'Створити макет сторінки логіну',
    status: 'new',
    author: oleh,
    assignee: kateryna,
    tags: [{ id: 't1', label: 'Дизайн', color: '#e8d9ff' }],
  },
  {
    id: 102,
    name: 'Налаштувати CI для фронтенду',
    status: 'new',
    author: andrii,
    assignee: andrii,
    tags: [{ id: 't2', label: 'DevOps' }],
  },
  {
    id: 103,
    name: 'Інтегрувати авторизацію через Google',
    status: 'in_progress',
    author: kateryna,
    assignee: sofia,
    tags: [
      { id: 't3', label: 'Backend', color: '#d7ecff' },
      { id: 't4', label: 'Терміново', color: '#ffd9d9' },
    ],
  },
  {
    id: 104,
    name: 'Написати компонент картки таски',
    status: 'in_progress',
    author: sofia,
    assignee: oleh,
    tags: [{ id: 't5', label: 'Frontend', color: '#d7ecff' }],
  },
  {
    id: 105,
    name: 'Ревʼю API для проєктів',
    status: 'review',
    author: andrii,
    assignee: kateryna,
    tags: [{ id: 't6', label: 'Backend', color: '#d7ecff' }],
  },
  {
    id: 106,
    name: 'Оновити документацію по деплою',
    status: 'done',
    author: oleh,
    assignee: andrii,
    tags: [{ id: 't7', label: 'Документація' }],
  },
  {
    id: 107,
    name: 'Виправити баг з відображенням тегів',
    status: 'overdue',
    author: sofia,
    assignee: sofia,
    tags: [
      { id: 't8', label: 'Bug', color: '#ffd9d9' },
      { id: 't9', label: 'Frontend', color: '#d7ecff' },
    ],
  },
]
