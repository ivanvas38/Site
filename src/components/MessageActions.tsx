import React, { useState } from 'react'
import { MoreHorizontal, Edit, Trash2, Check, X } from 'lucide-react'
import type { Message } from '../utils/api'

interface MessageActionsProps {
  message: Message
  isOwn: boolean
  onEdit: (messageId: string, newText: string) => void
  onDelete: (messageId: string) => void
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  isOwn,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.text)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(message.id, editText.trim())
    }
    setIsEditing(false)
    setShowMenu(false)
  }

  const handleCancelEdit = () => {
    setEditText(message.text)
    setIsEditing(false)
    setShowMenu(false)
  }

  const handleDelete = () => {
    onDelete(message.id)
    setShowDeleteConfirm(false)
    setShowMenu(false)
  }

  // Если сообщение удалено, не показываем действия
  if (message.isDeleted) {
    return null
  }

  // Если это режим редактирования
  if (isEditing) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="flex-1 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-white"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleEdit()
            } else if (e.key === 'Escape') {
              handleCancelEdit()
            }
          }}
          autoFocus
        />
        <button
          onClick={handleEdit}
          disabled={!editText.trim() || editText === message.text}
          className="p-1 hover:bg-green-500 hover:text-white rounded text-green-600 disabled:text-gray-400 disabled:hover:bg-transparent"
          title="Сохранить"
        >
          <Check className="w-3 h-3" />
        </button>
        <button
          onClick={handleCancelEdit}
          className="p-1 hover:bg-red-500 hover:text-white rounded text-red-600"
          title="Отменить"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  // Если это режим подтверждения удаления
  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-1 mt-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">Удалить?</span>
        <button
          onClick={handleDelete}
          className="p-1 hover:bg-red-500 hover:text-white rounded text-red-600"
          title="Подтвердить удаление"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="p-1 hover:bg-gray-500 hover:text-white rounded text-gray-600"
          title="Отменить"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    )
  }

  // Если это не свое сообщение, не показываем действия
  if (!isOwn) {
    return null
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black hover:bg-opacity-10 rounded-full transition-all duration-200"
        title="Действия с сообщением"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 min-w-[120px]">
            <button
              onClick={() => {
                setIsEditing(true)
                setShowMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-t-lg flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Изменить
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(true)
                setShowMenu(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Удалить
            </button>
          </div>
        </>
      )}
    </div>
  )
}