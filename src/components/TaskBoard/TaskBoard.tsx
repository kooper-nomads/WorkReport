import { TASK_STATUS_LABELS, TASK_STATUS_ORDER } from '../../constants/taskStatus'
import type { Task } from '../../types/task'
import { TaskCard } from '../TaskCard/TaskCard'
import './TaskBoard.css'

interface TaskBoardProps {
  tasks: Task[]
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  return (
    <div className="task-board">
      {TASK_STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status)

        return (
          <section className="task-board__column" key={status}>
            <header className="task-board__column-header">
              <h2 className="task-board__column-title">{TASK_STATUS_LABELS[status]}</h2>
              <span className="task-board__column-count">{columnTasks.length}</span>
            </header>

            <div className="task-board__column-tasks">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
