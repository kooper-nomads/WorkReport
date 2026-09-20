const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, init)

  if (!response.ok) {
    throw new Error(`Запит до бекенду завершився помилкою: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as T
}
