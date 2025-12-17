const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api'

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface LoginPayload {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    username: string
  }
  token: string
}

export interface RegisterResponse {
  user: {
    id: string
    email: string
    username: string
  }
  token: string
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = localStorage.getItem('token')
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    const responseBody = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: responseBody.message || 'Ошибка запроса',
      }
    }

    return {
      success: true,
      data: responseBody.data || responseBody,
      message: responseBody.message,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Ошибка подключения к серверу',
    }
  }
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    return fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  register: async (payload: RegisterPayload) => {
    return fetchApi<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  logout: async () => {
    return fetchApi('/auth/logout', {
      method: 'POST',
    })
  },

  getCurrentUser: async () => {
    return fetchApi('/auth/me', {
      method: 'GET',
    })
  },
}

export interface User {
  id: string
  email: string
  username: string
}

export interface Message {
  id: string
  text: string
  senderId: string
  senderUsername: string
  deliveredAt: string | null
  readAt: string | null
  createdAt: string
}

export interface Conversation {
  id: string
  otherUser: User
  lastMessage: {
    text: string
    deliveredAt: string | null
    readAt: string | null
    createdAt: string
  } | null
  updatedAt: string
}

export interface SendMessageResponse {
  message: Message
  conversation: {
    id: string
    user1Id: string
    user2Id: string
  }
}

export const api = {
  get: <T,>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'GET' }),
  
  post: <T,>(endpoint: string, data?: Record<string, unknown>) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: <T,>(endpoint: string, data?: Record<string, unknown>) =>
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: <T,>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
}

export const messengerApi = {
  // Получить всех пользователей
  getAllUsers: async () => {
    return fetchApi<User[]>('/users', { method: 'GET' })
  },
  
  // Получить диалоги текущего пользователя
  getConversations: async () => {
    return fetchApi<Conversation[]>('/conversations', { method: 'GET' })
  },
  
  // Получить сообщения диалога
  getConversationMessages: async (conversationId: string) => {
    return fetchApi<Message[]>(`/conversations/${conversationId}/messages`, { method: 'GET' })
  },
  
  // Отправить сообщение
  sendMessage: async (conversationId: string | undefined, recipientId: string | undefined, text: string) => {
    return fetchApi<SendMessageResponse>('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ conversationId, recipientId, text })
    })
  },

  // Отметить сообщение как доставленное
  markAsDelivered: async (messageId: string) => {
    return fetchApi<{ message: string }>(`/messages/${messageId}/deliver`, {
      method: 'PATCH'
    })
  },

  // Отметить сообщение как прочитанное
  markAsRead: async (messageId: string) => {
    return fetchApi<{ message: string }>(`/messages/${messageId}/read`, {
      method: 'PATCH'
    })
  }
}
