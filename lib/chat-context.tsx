'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { ChatMessage } from '@/types'

interface ChatContextType {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  sendMessage: (content: string, dayId?: string | null) => Promise<void>
  clearMessages: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const openChat = useCallback(() => setIsOpen(true), [])
  const closeChat = useCallback(() => setIsOpen(false), [])
  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      if (prev) setMessages([]) // Auto-clear on close
      return !prev
    })
  }, [])
  const clearMessages = useCallback(() => setMessages([]), [])

  const sendMessage = useCallback(async (content: string, dayId?: string | null) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const apiMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, dayId }),
      })

      if (!response.ok) {
        const err = await response.json()
        setMessages(prev => [...prev, {
          ...assistantMsg,
          content: err.error || 'COACH IS OFFLINE. Make sure LM Studio is running on localhost:1234.',
        }])
        setIsLoading(false)
        return
      }

      // Add empty assistant message, then stream into it
      setMessages(prev => [...prev, assistantMsg])

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            const delta = parsed.choices?.[0]?.delta?.content || ''
            accumulated += delta
            const current = accumulated
            setMessages(prev =>
              prev.map(m => m.id === assistantMsg.id ? { ...m, content: current } : m)
            )
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        ...assistantMsg,
        content: 'COACH IS OFFLINE. Make sure LM Studio is running on localhost:1234.',
      }])
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  return (
    <ChatContext.Provider value={{
      messages, isOpen, isLoading,
      openChat, closeChat, toggleChat,
      sendMessage, clearMessages,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
