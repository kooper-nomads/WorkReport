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
    <main className="connect-worksection">
      <section className="connect-worksection__card" aria-labelledby="connect-worksection-title">
        <div className="connect-worksection__logo" aria-hidden="true">
          W
        </div>
        <h1 id="connect-worksection-title" className="connect-worksection__title">
          Вхід у платформу
        </h1>
        <p className="connect-worksection__hint">
          Доступ до звітів по задачах надається через ваш акаунт Worksection.
        </p>
        {error && (
          <p className="connect-worksection__error" role="alert">
            {error}
          </p>
        )}
        {/* Plain navigation, not a fetch: the backend responds with a redirect chain to Worksection. */}
        <a className="connect-worksection__button" href={`${API_URL}/auth/worksection/login`}>
          Увійти через Worksection
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3 8h10m0 0L9 4m4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <p className="connect-worksection__footnote">
          Вас буде перенаправлено на сторінку авторизації Worksection. Ваш пароль не передається
          на платформу.
        </p>
      </section>
    </main>
  )
}
