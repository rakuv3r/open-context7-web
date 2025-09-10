// API client for connecting to FastAPI backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api/v1'

export interface Library {
  id: string
  title: string
  description: string
  branch: string
  lastUpdateDate: string
  state: 'processing' | 'finalized' | 'failed'
  totalTokens: number
  versions: string[]
  trustScore?: number
}

export interface SearchLibrariesResponse {
  results: Library[]
}

export interface BaseResponse {
  data?: any
  message: string
  createdAt: string
  requestId: string
}

export interface CreateLibraryRequest {
  repoUrl: string
  accessToken: string
}

export interface CreateFromContentRequest {
  title: string
  description: string
  files: Record<string, string>
}

export interface QueryParams {
  topic?: string
  tokens?: number
  tag?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body)
    }

    try {
      const response = await fetch(url, config)
      
      // Check for HTTP-level errors
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || data.detail || data.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      // For text responses (like document queries), return text directly
      if (endpoint.includes('/query') || response.headers.get('content-type')?.includes('text/plain')) {
        return response.text() as T
      }

      // Parse JSON response data
      const data = await response.json()
      
      // Check for business logic errors (retcode != 0)
      if (data.retcode !== undefined && data.retcode !== 0) {
        throw new Error(data.error || data.message || `业务错误，错误码: ${data.retcode}`)
      }

      // Return data field if present, otherwise return entire response
      return (data.data !== undefined ? data.data : data) as T
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Search libraries - corresponds to GET /search
  async searchLibraries(params?: {
    query?: string
    limit?: number
    offset?: number
  }): Promise<SearchLibrariesResponse> {
    const searchParams = new URLSearchParams()
    
    if (params?.query) searchParams.set('query', params.query)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    else searchParams.set('limit', '10')
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    else searchParams.set('offset', '0')

    return this.request<SearchLibrariesResponse>(
      `/search?${searchParams.toString()}`
    )
  }

  // Create library - corresponds to POST /
  async createLibrary(data: CreateLibraryRequest): Promise<BaseResponse> {
    return this.request<BaseResponse>('/', {
      method: 'POST',
      body: data as any,
    })
  }

  // Create library from content - corresponds to POST /{org}/{project}/content
  async createFromContent(
    org: string,
    project: string,
    data: CreateFromContentRequest
  ): Promise<BaseResponse> {
    return this.request<BaseResponse>(`/${org}/${project}/content`, {
      method: 'POST',
      body: data as any,
    })
  }

  // Query library documents - corresponds to GET /{org}/{project}[/{tag}]
  async queryLibrary(
    org: string,
    project: string,
    params?: QueryParams,
    tag?: string
  ): Promise<string> {
    const searchParams = new URLSearchParams()
    
    if (params?.topic) searchParams.set('topic', params.topic)
    if (params?.tokens) searchParams.set('tokens', params.tokens.toString())
    
    const path = tag ? `/${org}/${project}/${tag}` : `/${org}/${project}`
    const url = `${path}?${searchParams.toString()}`

    return this.request<string>(url)
  }

  // Get library tags - corresponds to GET /{org}/{project}/tags
  async getTags(org: string, project: string): Promise<string[]> {
    try {
      const response = await this.request<{ data: string[] } | string[]>(`/${org}/${project}/tags`)
      
      // Handle different response formats
      if (Array.isArray(response)) {
        return response
      } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
        return response.data
      } else {
        return []
      }
    } catch (error) {
      console.error('Error fetching tags:', error)
      return []
    }
  }

  // Rebuild library - corresponds to POST /{org}/{project}/rebuild
  async rebuildLibrary(org: string, project: string): Promise<BaseResponse> {
    return this.request<BaseResponse>(`/${org}/${project}/rebuild`, {
      method: 'POST',
    })
  }

  // Add tag - corresponds to POST /{org}/{project}/tags/{tag}
  async addTag(org: string, project: string, tag: string): Promise<BaseResponse> {
    return this.request<BaseResponse>(`/${org}/${project}/tags/${tag}`, {
      method: 'POST',
    })
  }

  // Get library metadata - corresponds to GET /{org}/{project}/meta
  async getLibraryMeta(org: string, project: string): Promise<any> {
    return this.request<any>(`/${org}/${project}/meta`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export convenience methods
export const {
  searchLibraries,
  createLibrary,
  createFromContent,
  queryLibrary,
  getTags,
  rebuildLibrary,
  addTag,
  getLibraryMeta,
} = apiClient