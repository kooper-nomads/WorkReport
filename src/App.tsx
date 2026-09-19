import { TaskBoard } from './components/TaskBoard/TaskBoard'
import { mockTasks } from './data/mockTasks'

function App() {
  return <TaskBoard tasks={mockTasks} />
}

export default App
