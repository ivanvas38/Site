import React from 'react'
import { Check, CheckCheck } from 'lucide-react'

interface MessageStatusProps {
  deliveredAt: string | null
  readAt: string | null
  isOwn: boolean
  size?: 'sm' | 'md'
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  deliveredAt,
  readAt,
  isOwn,
  size = 'md'
}) => {
  if (!isOwn) return null

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4'
  }

  const formatReadTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (readAt) {
    return (
      <div className={`flex items-center ${size === 'sm' ? 'ml-1' : 'ml-2'}`}>
        <div 
          title={`Прочитано: ${formatReadTime(readAt)}`}
          className="flex"
        >
          <CheckCheck className={`${sizeClasses[size]} text-blue-500`} />
        </div>
      </div>
    )
  }

  if (deliveredAt) {
    return (
      <div className={`flex items-center ${size === 'sm' ? 'ml-1' : 'ml-2'}`}>
        <div title={`Доставлено: ${formatReadTime(deliveredAt)}`}>
          <CheckCheck className={`${sizeClasses[size]} text-gray-400`} />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${size === 'sm' ? 'ml-1' : 'ml-2'}`}>
      <div title="Отправлено">
        <Check className={`${sizeClasses[size]} text-gray-400`} />
      </div>
    </div>
  )
}