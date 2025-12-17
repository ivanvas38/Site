import React, { useState, useRef, useEffect } from 'react'
import { Send, ArrowLeft } from 'lucide-react'
import type { Message, Conversation, User as UserType } from '../utils/api'
import { MessageStatus } from './MessageStatus'
import { MessageActions } from './MessageActions'
import { messengerApi } from '../utils/api'
import UserAvatar from './UserAvatar'

interface ChatWindowProps {
  selectedConversation: Conversation | null
  messages: Message[]
  currentUser: UserType | null
  onSendMessage: (text: string) => void
  onEditMessage?: (messageId: string, newText: string) => void
  onDeleteMessage?: (messageId: string) => void
  onBack?: () => void
  onClose?: () => void
  loading?: boolean
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedConversation,
  messages,
  currentUser,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onBack,
  onClose,
  loading = false,
}) => {
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mark incoming messages as delivered when conversation loads
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && currentUser) {
      const deliverMessages = async () => {
        const incomingMessages = messages.filter(
          msg => msg.senderId !== currentUser.id && !msg.deliveredAt
        )
        
        for (const message of incomingMessages) {
          try {
            await messengerApi.markAsDelivered(message.id)
          } catch (error) {
            console.error('Failed to mark message as delivered:', error)
          }
        }
      }

      deliverMessages()
    }
  }, [selectedConversation, messages, currentUser])

  // Mark messages as read when user scrolls to them
  useEffect(() => {
    if (selectedConversation && messages.length > 0 && currentUser) {
      const markAsRead = async () => {
        const unreadMessages = messages.filter(
          msg => msg.senderId !== currentUser.id && !msg.readAt
        )
        
        for (const message of unreadMessages) {
          try {
            await messengerApi.markAsRead(message.id)
          } catch (error) {
            console.error('Failed to mark message as read:', error)
          }
        }
      }

      // Mark as read after a short delay (simulating user viewing the message)
      const timer = setTimeout(markAsRead, 1000)
      return () => clearTimeout(timer)
    }
  }, [selectedConversation, messages, currentUser])

  const handleSendMessage = () => {
    if (inputText.trim() && selectedConversation) {
      onSendMessage(inputText.trim())
      setInputText('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!onEditMessage) return
    
    try {
      await onEditMessage(messageId, newText)
    } catch (error) {
      console.error('Failed to edit message:', error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!onDeleteMessage) return
    
    try {
      await onDeleteMessage(messageId)
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (days === 1) {
      return 'Вчера'
    } else if (days < 7) {
      return date.toLocaleDateString('ru-RU', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
      })
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, message) => {
    const dateKey = formatDate(message.createdAt)
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(message)
    return groups
  }, {})

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <Send className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Добро пожаловать в Мессенджер
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Выберите диалог или начните новый
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
              title="Назад к списку диалогов"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          
          <UserAvatar user={selectedConversation.otherUser} size="md" showOnlineStatus={true} />
          
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {selectedConversation.otherUser.name}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedConversation.otherUser.isOnline ? (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  В сети
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  Не в сети
                </span>
              )}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Закрыть чат"
            >
              <span className="text-gray-600 dark:text-gray-400 text-lg">✕</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.keys(groupedMessages).length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                Пока нет сообщений. Напишите первое!
              </p>
            </div>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center my-4">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                <span className="px-3 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                  {date}
                </span>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const isOwn = message.senderId === currentUser?.id
                const showAvatar = !isOwn && (
                  index === 0 || 
                  dateMessages[index - 1].senderId !== message.senderId
                )

                return (
                  <div
                    key={message.id}
                    className={`flex group ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      {showAvatar && (
                        <UserAvatar user={selectedConversation.otherUser} size="sm" showOnlineStatus={false} />
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-2 rounded-2xl relative ${
                          message.isDeleted
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic'
                            : isOwn
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                        }`}
                      >
                        {/* Deleted message indicator */}
                        {message.isDeleted ? (
                          <p className="text-sm">Сообщение удалено</p>
                        ) : (
                          <>
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                            <MessageActions
                              message={message}
                              isOwn={isOwn}
                              onEdit={handleEditMessage}
                              onDelete={handleDeleteMessage}
                            />
                          </>
                        )}
                        
                        {/* Message info */}
                        {!message.isDeleted && (
                          <div className="flex items-center justify-end gap-1">
                            <p className={`text-xs mt-1 ${
                              isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {formatTime(message.createdAt)}
                              {message.isEdited ? ' (изменено)' : ''}
                            </p>
                            <MessageStatus
                              deliveredAt={message.deliveredAt}
                              readAt={message.readAt}
                              isOwn={isOwn}
                              size="sm"
                            />
                          </div>
                        )}
                        
                        {/* Deleted message time */}
                        {message.isDeleted && (
                          <p className={`text-xs mt-1 ${
                            isOwn ? 'text-gray-300' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {formatTime(message.createdAt)} • удалено
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Введите сообщение..."
            rows={1}
            className="flex-1 resize-none px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm max-h-32"
            style={{ minHeight: '48px', maxHeight: '128px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}