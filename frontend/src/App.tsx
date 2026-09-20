import { TaskReport } from './components/TaskReport/TaskReport'
import { mockTasks } from './data/mockTasks'

function App() {
  return <TaskReport tasks={mockTasks} defaultPeriod={{ from: '2026-08-01', to: '2026-09-20' }} />
}

export default App
