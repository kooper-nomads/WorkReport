import type { Task } from '../types/task'

const oleh = { id: 'u1', name: 'Олег Іваненко' }
const kateryna = { id: 'u2', name: 'Катерина Бойко' }
const andrii = { id: 'u3', name: 'Андрій Мельник' }
const sofia = { id: 'u4', name: 'Софія Ткаченко' }

export const mockTasks: Task[] = [
  {
    id: 101,
    name: 'Створити макет сторінки логіну',
    status: 'active',
    author: oleh,
    assignee: kateryna,
    tags: [{ id: 't1', label: 'Дизайн', color: '#e8d9ff' }],
    events: [
      {
        id: 'e101-1',
        action: 'post',
        date: '2026-08-04 09:47',
        userFrom: oleh.name,
        summary: 'Задачу створено, призначено на Катерина Бойко',
      },
    ],
  },
  {
    id: 102,
    name: 'Налаштувати CI для фронтенду',
    status: 'active',
    author: andrii,
    assignee: andrii,
    tags: [{ id: 't2', label: 'DevOps' }],
    events: [
      {
        id: 'e102-1',
        action: 'post',
        date: '2026-09-15 11:02',
        userFrom: andrii.name,
        summary: 'Задачу створено',
      },
    ],
  },
  {
    id: 103,
    name: 'Інтегрувати авторизацію через Google',
    status: 'active',
    author: kateryna,
    assignee: sofia,
    tags: [
      { id: 't3', label: 'Backend', color: '#d7ecff' },
      { id: 't4', label: 'Терміново', color: '#ffd9d9' },
    ],
    events: [
      {
        id: 'e103-1',
        action: 'post',
        date: '2026-08-11 10:15',
        userFrom: kateryna.name,
        summary: 'Задачу створено, призначено на ANY',
      },
      {
        id: 'e103-2',
        action: 'update',
        date: '2026-09-02 14:30',
        userFrom: sofia.name,
        summary: 'Взяв задачу в роботу (призначено на Софія Ткаченко)',
      },
      {
        id: 'e103-3',
        action: 'update',
        date: '2026-09-18 17:05',
        userFrom: sofia.name,
        summary: 'Статус змінено на «В роботі»',
      },
    ],
  },
  {
    id: 104,
    name: 'Написати компонент картки таски',
    status: 'active',
    author: sofia,
    assignee: oleh,
    tags: [{ id: 't5', label: 'Frontend', color: '#d7ecff' }],
    events: [
      {
        id: 'e104-1',
        action: 'post',
        date: '2026-09-10 08:40',
        userFrom: sofia.name,
        summary: 'Задачу створено, призначено на Олег Іваненко',
      },
      {
        id: 'e104-2',
        action: 'update',
        date: '2026-09-19 12:00',
        userFrom: oleh.name,
        summary: 'Додано коментар до задачі',
      },
    ],
  },
  {
    id: 105,
    name: 'Ревʼю API для проєктів',
    status: 'active',
    author: andrii,
    assignee: kateryna,
    tags: [{ id: 't6', label: 'Backend', color: '#d7ecff' }],
    events: [
      {
        id: 'e105-1',
        action: 'post',
        date: '2026-08-20 09:00',
        userFrom: andrii.name,
        summary: 'Задачу створено, призначено на Катерина Бойко',
      },
      {
        id: 'e105-2',
        action: 'update',
        date: '2026-09-05 16:45',
        userFrom: kateryna.name,
        summary: 'Статус змінено на «На перевірці»',
      },
    ],
  },
  {
    id: 106,
    name: 'Оновити документацію по деплою',
    status: 'done',
    author: oleh,
    assignee: andrii,
    tags: [{ id: 't7', label: 'Документація' }],
    events: [
      {
        id: 'e106-1',
        action: 'post',
        date: '2026-08-25 13:20',
        userFrom: oleh.name,
        summary: 'Задачу створено, призначено на Андрій Мельник',
      },
      {
        id: 'e106-2',
        action: 'close',
        date: '2026-09-08 18:52',
        userFrom: andrii.name,
        summary: 'Задачу закрито',
      },
    ],
  },
  {
    id: 107,
    name: 'Виправити баг з відображенням тегів',
    status: 'active',
    author: sofia,
    assignee: sofia,
    tags: [
      { id: 't8', label: 'Bug', color: '#ffd9d9' },
      { id: 't9', label: 'Frontend', color: '#d7ecff' },
    ],
    events: [
      {
        id: 'e107-1',
        action: 'post',
        date: '2026-09-12 10:10',
        userFrom: sofia.name,
        summary: 'Задачу створено',
      },
      {
        id: 'e107-2',
        action: 'update',
        date: '2026-09-17 09:30',
        userFrom: sofia.name,
        summary: 'Дедлайн прострочено, статус змінено на «Прострочена»',
      },
    ],
  },
]
