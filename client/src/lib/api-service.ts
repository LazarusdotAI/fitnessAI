import { toast } from '../hooks/use-toast';

interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiRequestConfig {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: unknown;
  credentials?: RequestCredentials;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const error = isJson ? data : { error: data, code: 'UNKNOWN_ERROR' };
      throw error;
    }

    return data as T;
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const apiError = error as ApiError;
      if (apiError.error) {
        return apiError.error;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred';
  }

  private createRequestInit(options: ApiRequestConfig): RequestInit {
    const { method = 'GET', headers = {}, body, credentials = 'include' } = options;

    const init: RequestInit = {
      method,
      credentials,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    return init;
  }

  private async request<T>(endpoint: string, options: ApiRequestConfig = {}): Promise<T> {
    try {
      const requestInit = this.createRequestInit(options);
      const response = await fetch(`${this.baseUrl}${endpoint}`, requestInit);
      return await this.handleResponse<T>(response);
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive",
        });
        throw error;
      }

      // Handle API errors
      const message = this.getErrorMessage(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/api/login', {
      method: 'POST',
      body: { username, password }
    });
  }

  async register(data: unknown) {
    return this.request('/api/register', {
      method: 'POST',
      body: data
    });
  }

  async logout() {
    return this.request('/api/logout', {
      method: 'POST'
    });
  }

  async getCurrentUser() {
    return this.request('/api/user');
  }

  async checkUsername(username: string) {
    return this.request('/api/check-username', {
      method: 'POST',
      body: { username }
    });
  }

  // Assessment endpoints
  async analyzeAssessment(data: unknown) {
    return this.request('/api/analyze-assessment', {
      method: 'POST',
      body: data
    });
  }

  async generateWorkout(data: unknown) {
    return this.request('/api/generate-workout', {
      method: 'POST',
      body: data
    });
  }

  // Generic request methods
  async get<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { method: 'GET', ...config });
  }

  async post<T>(endpoint: string, data: unknown, config: Omit<ApiRequestConfig, 'method'> = {}) {
    return this.request<T>(endpoint, { method: 'POST', body: data, ...config });
  }

  async put<T>(endpoint: string, data: unknown, config: Omit<ApiRequestConfig, 'method'> = {}) {
    return this.request<T>(endpoint, { method: 'PUT', body: data, ...config });
  }

  async delete<T>(endpoint: string, config: Omit<ApiRequestConfig, 'method' | 'body'> = {}) {
    return this.request<T>(endpoint, { method: 'DELETE', ...config });
  }
}

// Create and export a singleton instance
export const api = new ApiService();

// Export the class for testing or custom instances
export { ApiService };
