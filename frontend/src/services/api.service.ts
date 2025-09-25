// API service for REST endpoints
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`

export interface CreatePollRequest {
  pollId: string
  title: string
  teacherId?: string  // Optional - should be MongoDB ObjectId format if provided
  config?: {
    maxStudents?: number
    allowLateJoin?: boolean
    showLiveResults?: boolean
  }
}

export interface PollResponse {
  success: boolean
  data: {
    pollId: string
    title: string
    teacherId: string
    status: 'waiting' | 'active' | 'ended'
    participants: number
    config: any
    createdAt: string
    updatedAt: string
  }
  message?: string
}

export interface PollResultsResponse {
  success: boolean
  data: {
    pollId: string
    questions: Array<{
      questionId: string
      text: string
      options: Array<{
        optionId: string
        text: string
        count: number
        percentage: number
        isCorrect?: boolean
      }>
      totalResponses: number
      stats: {
        correctAnswers?: number
        averageTime?: number
      }
    }>
    participants: Array<{
      clientId: string
      displayName: string
      role: string
      answers: Array<{
        questionId: string
        optionId: string
        timestamp: string
      }>
    }>
    summary: {
      totalQuestions: number
      totalParticipants: number
      averageScore?: number
    }
  }
  message?: string
}

class ApiService {
  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Poll Management
  async createPoll(pollData: CreatePollRequest): Promise<PollResponse> {
    return this.request<PollResponse>('/polls', {
      method: 'POST',
      body: JSON.stringify(pollData),
    })
  }

  async getAllPolls(): Promise<{ success: boolean; data: Array<any>; message?: string }> {
    return this.request('/polls')
  }

  async getPoll(pollId: string): Promise<PollResponse> {
    return this.request<PollResponse>(`/polls/${pollId}`)
  }

  async getPollResults(pollId: string): Promise<PollResultsResponse> {
    return this.request<PollResultsResponse>(`/polls/${pollId}/results`)
  }

  async endPoll(pollId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/polls/${pollId}/end`, {
      method: 'POST',
    })
  }

  async kickUser(pollId: string, clientId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/polls/${pollId}/kick`, {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    })
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health')
  }

  // Helper methods
  isValidPollId(pollId: string): boolean {
    return typeof pollId === 'string' && pollId.length >= 3 && pollId.length <= 20
  }

  generatePollId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  // Error handling helper
  handleApiError(error: any): string {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'An unexpected error occurred'
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService
