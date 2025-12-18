import React from 'react'
import { Search, MessageSquare, ArrowLeft } from 'lucide-react'
import type { Conversation } from '../utils/api'
import { MessageStatus } from './MessageStatus'
import UserAvatar from './UserAvatar'
import { formatCompactTimeInTimezone } from '../utils/timezone'

interface ConversationsListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (conversationId: string) => void
  onNewDialog: () => void
  searchTerm: string
  onSearchChange: (term: string) => void
  loading?: boolean
  onBack?: () => void
  userTimezone?: string
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedId,
  onSelect,
  onNewDialog,
  searchTerm,
  onSearchChange,
  loading = false,
  onBack,
  userTimezone = 'UTC',
}) => {
  const formatTime = (timestamp: string) => {
    return formatCompactTimeInTimezone(timestamp, userTimezone)
  }

  const truncateMessage = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text
  }

  if (loading) {
    return (
      <div className="w-80 bg-gray-50 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {onBack && (
              <button className="p-2 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 dark:text-white">Мессенджер</h2>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <div className="w-full h-10 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="w-24 h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">Мессенджер</h2>
          </div>
          <button
            onClick={onNewDialog}
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors"
            title="Новый диалог"
          >
            <MessageSquare className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? 'Ничего не найдено' : 'Нет диалогов'}
            </p>
            {!searchTerm && (
              <button
                onClick={onNewDialog}
                className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
              >
                Начать новый диалог
              </button>
            )}
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`p-4 border-b border-gray-100 dark:border-gray-800 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                selectedId === conversation.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <UserAvatar user={conversation.otherUser} size="md" showOnlineStatus={true} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {conversation.otherUser.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessage?.createdAt || conversation.updatedAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {truncateMessage(conversation.lastMessage?.text || '')}
                    </p>
                    {conversation.lastMessage && (
                      <MessageStatus
                        deliveredAt={conversation.lastMessage.deliveredAt}
                        readAt={conversation.lastMessage.readAt}
                        isOwn={false}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}