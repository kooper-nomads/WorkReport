import { TaskReport } from './components/TaskReport/TaskReport'
import { ConnectWorksection } from './components/ConnectWorksection/ConnectWorksection'
import { Spinner } from './components/Spinner/Spinner'
import { useAuthStatus, useLogout } from './api/useAuth'
import './App.css'

function App() {
  const { data: authStatus, isLoading } = useAuthStatus()
  const logout = useLogout()

  if (isLoading) {
    return (
      <div className="app-loading">
        <Spinner size={28} label="Перевіряємо авторизацію…" />
      </div>
    )
  }

  if (authStatus?.platformAuthMethod === 'worksection_oauth' && !authStatus.connected) {
    return <ConnectWorksection />
  }

  return (
    <>
      {authStatus?.connection && (
        <div className="app-connection-bar">
          <span>Підключено як {authStatus.connection.email}</span>
          <button
            type="button"
            className="app-connection-bar__logout"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            Відключити
          </button>
        </div>
      )}
      <TaskReport />
    </>
  )
}

export default App
