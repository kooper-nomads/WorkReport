import { useState } from 'react'
import { API_URL } from '../../api/client'
import './ConnectWorksection.css'

const ERROR_MESSAGES: Record<string, string> = {
  state: 'Сесію авторизації прострочено або її відкрили повторно в іншій вкладці. Спробуйте ще раз.',
  exchange: 'Не вдалося завершити авторизацію через Worksection. Спробуйте ще раз.',
}

// Reads ?worksectionAuthError=... once at mount and strips it from the URL, so a page reload
// doesn't keep showing a stale error. The backend redirects here with that flag on a failed
// login instead of showing a dead-end JSON error page.
function readAuthError(): string | null {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('worksectionAuthError')
  if (!code) return null

  params.delete('worksectionAuthError')
  const query = params.toString()
  window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)

  return ERROR_MESSAGES[code] ?? 'Не вдалося авторизуватись через Worksection. Спробуйте ще раз.'
}

export function ConnectWorksection() {
  const [error] = useState(readAuthError)

  return (
    <div className="connect-worksection">
      <h2>Підключіть Worksection</h2>
      <p className="connect-worksection__hint">
        Щоб побачити звіт, увійдіть через Worksection — ми будемо використовувати ваш токен доступу
        для запитів до Worksection API.
      </p>
      {error && <p className="connect-worksection__error">{error}</p>}
      {/* Plain navigation, not a fetch: the backend responds with a redirect chain to Worksection. */}
      <a className="connect-worksection__button" href={`${API_URL}/auth/worksection/login`}>
        Увійти через Worksection
      </a>
    </div>
  )
}
