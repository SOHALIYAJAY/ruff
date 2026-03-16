const BASE_URL = 'http://localhost:8000'

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}

class APIClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<{ data: T; status: number }> {
    const { params, ...fetchOptions } = options
    
    let url = `${this.baseURL}${endpoint}`
    
    if (params) {
      const queryString = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        queryString.append(key, String(value))
      })
      url += `?${queryString.toString()}`
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return { data, status: response.status }
  }

  async get<T>(endpoint: string, options?: RequestOptions) {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
    return { data: response.data }
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
    return { data: response.data }
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
    return { data: response.data }
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
    return { data: response.data }
  }

  async delete<T>(endpoint: string, options?: RequestOptions) {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
    return { data: response.data }
  }
}

const api = new APIClient(BASE_URL)

export default api
