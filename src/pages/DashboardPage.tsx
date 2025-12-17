import React, { useState, useEffect } from 'react'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigation } from '../context/NavigationContext'
import { ConversationsList } from '../components/ConversationsList'
import { ChatWindow } from '../components/ChatWindow'
import { UsersList } from '../components/UsersList'
import ActivityTracker from '../components/ActivityTracker'
import { messengerApi } from '../utils/api'
import type { Conversation, Message, User as UserType } from '../utils/api'

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth()
  const { navigate } = useNavigation()

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showUsersList, setShowUsersList] = useState(false)
  const [mobileView, setMobileView] = useState<'conversations' | 'chat'>('conversations')
  const [loading, setLoading] = useState({
    conversations: false,
    messages: false,
    users: false,
  })

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  // Optimized real-time polling for new messages and conversation updates
  useEffect(() => {
    if (!selectedConversation) return;

    // Load initial messages when conversation is selected
    const loadInitialMessages = async () => {
      const result = await messengerApi.getConversationMessages(selectedConversation.id);
      if (result.success && result.data) {
        setMessages(result.data);
        
        // Auto scroll to bottom after loading
        setTimeout(() => {
          const chatWindow = document.querySelector('.chat-messages');
          if (chatWindow) {
            chatWindow.scrollTop = chatWindow.scrollHeight;
          }
        }, 100);
      }
      setLoading(prev => ({ ...prev, messages: false }));
    };

    loadInitialMessages();

    // Polling for new messages only (every 3 seconds)
    const messageInterval = setInterval(async () => {
      try {
        const lastMessageId = messages[messages.length - 1]?.id || 0;
        
        const result = await messengerApi.getConversationMessages(selectedConversation.id);
        if (result.success && result.data) {
          // Filter only new messages (with ID > lastMessageId)
          const newMessages = result.data.filter(msg => msg.id > lastMessageId);
          
          // If there are new messages, add them to the end
          if (newMessages.length > 0) {
            setMessages(prev => [...prev, ...newMessages]);
            
            // Auto scroll to new messages
            setTimeout(() => {
              const chatWindow = document.querySelector('.chat-messages');
              if (chatWindow) {
                chatWindow.scrollTop = chatWindow.scrollHeight;
              }
            }, 0);
          }
        }
      } catch (error) {
        console.error('Failed to load new messages:', error);
      }
    }, 3000);

    // Separate interval for updating conversations list (less frequently - every 5 seconds)
    const conversationInterval = setInterval(() => {
      loadConversations();
    }, 5000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(conversationInterval);
    };
  }, [selectedConversation, messages]);

  const loadConversations = async () => {
    setLoading(prev => ({ ...prev, conversations: true }))
    try {
      const result = await messengerApi.getConversations()
      if (result.success && result.data) {
        setConversations(result.data)
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(prev => ({ ...prev, conversations: false }))
    }
  }

  const loadMessages = async (conversationId: string) => {
    setLoading(prev => ({ ...prev, messages: true }))
    try {
      const result = await messengerApi.getConversationMessages(conversationId)
      if (result.success && result.data) {
        setMessages(result.data)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(prev => ({ ...prev, messages: false }))
    }
  }

  const loadUsers = async () => {
    setLoading(prev => ({ ...prev, users: true }))
    try {
      const result = await messengerApi.getAllUsers()
      if (result.success && result.data) {
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation) return

    try {
      const result = await messengerApi.sendMessage(selectedConversation.id, undefined, text)
      if (result.success && result.data) {
        // The backend returns { message: {...}, conversation: {...} }
        const newMessage = result.data.message
        if (newMessage) {
          // Add message locally for immediate feedback
          setMessages(prev => [...prev, newMessage])
          
          // Auto scroll to the new message
          setTimeout(() => {
            const chatWindow = document.querySelector('.chat-messages');
            if (chatWindow) {
              chatWindow.scrollTop = chatWindow.scrollHeight;
            }
          }, 0);
          
          // Refresh conversations to update last message
          loadConversations()
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!selectedConversation) return

    try {
      const result = await messengerApi.editMessage(messageId, newText)
      if (result.success && result.data) {
        // Update the message in the local state
        const updatedMessage = result.data.message
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        ))
        
        // Refresh conversations to update last message if needed
        loadConversations()
      }
    } catch (error) {
      console.error('Failed to edit message:', error)
      throw error // Re-throw to let ChatWindow handle it
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return

    try {
      const result = await messengerApi.deleteMessage(messageId)
      if (result.success && result.data) {
        // Update the message in the local state
        const deletedMessage = result.data.message
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? deletedMessage : msg
        ))
        
        // Refresh conversations to update last message if needed
        loadConversations()
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      throw error // Re-throw to let ChatWindow handle it
    }
  }

  const handleNewDialog = async () => {
    await loadUsers()
    setShowUsersList(true)
  }

  const handleSelectUser = async (userId: string) => {
    setShowUsersList(false)
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.otherUser.id === userId
    )

    if (existingConversation) {
      setSelectedConversation(existingConversation)
      if (window.innerWidth < 1024) {
        setMobileView('chat')
      }
    } else {
      // For new conversation, we need to send an initial message
      // Use a placeholder message that can be edited later
      try {
        const initialMessage = 'Привет! Это первое сообщение в нашем диалоге. Напишите ответ!'
        const result = await messengerApi.sendMessage(undefined, userId, initialMessage)
        if (result.success && result.data) {
          // Reload conversations to get the new one
          await loadConversations()
          // Find the new conversation
          const newConversation = conversations.find(conv => 
            conv.otherUser.id === userId
          )
          if (newConversation) {
            setSelectedConversation(newConversation)
            // Load messages for the new conversation
            await loadMessages(newConversation.id)
            if (window.innerWidth < 1024) {
              setMobileView('chat')
            }
          }
        }
      } catch (error) {
        console.error('Failed to start conversation:', error)
      }
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId)
    if (conversation) {
      setSelectedConversation(conversation)
      if (window.innerWidth < 1024) {
        setMobileView('chat')
      }
    }
  }

  const handleCloseChat = () => {
    setSelectedConversation(null)
  }

  const handleLogout = () => {
    logout()
  }

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conversation =>
    conversation.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conversation.lastMessage?.text && 
     conversation.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-white">
              {user?.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('profile')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            title="Перейти к профилю"
          >
            <User className="w-4 h-4" />
            Профиль
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            title="Выйти из аккаунта"
          >
            <LogOut className="w-4 h-4" />
            Выход
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden lg:flex w-full">
          <ConversationsList
            conversations={filteredConversations}
            selectedId={selectedConversation?.id || null}
            onSelect={handleSelectConversation}
            onNewDialog={handleNewDialog}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            loading={loading.conversations}
          />

          <ChatWindow
            selectedConversation={selectedConversation}
            messages={messages}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onClose={handleCloseChat}
            loading={loading.messages}
          />
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden w-full">
          {mobileView === 'conversations' && (
            <ConversationsList
              conversations={filteredConversations}
              selectedId={selectedConversation?.id || null}
              onSelect={handleSelectConversation}
              onNewDialog={handleNewDialog}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              loading={loading.conversations}
              onBack={() => setMobileView('chat')}
            />
          )}

          {mobileView === 'chat' && (
            <ChatWindow
              selectedConversation={selectedConversation}
              messages={messages}
              currentUser={user}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              loading={loading.messages}
              onBack={() => setMobileView('conversations')}
            />
          )}
        </div>
      </div>

      {/* Users List Modal */}
      {showUsersList && (
        <UsersList
          users={users}
          onSelectUser={handleSelectUser}
          onClose={() => setShowUsersList(false)}
          loading={loading.users}
        />
      )}

      {/* Activity Tracker for online status updates */}
      <ActivityTracker enabled={true} intervalMs={30000} />
    </div>
  )
}
