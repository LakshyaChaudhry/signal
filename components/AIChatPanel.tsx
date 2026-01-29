'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChat } from '@/lib/chat-context'

interface AIChatPanelProps {
  dayId?: string | null
}

export default function AIChatPanel({ dayId }: AIChatPanelProps) {
  const { messages, isOpen, isLoading, sendMessage } = useChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage(input.trim(), dayId)
    setInput('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 right-8 z-40 w-96 h-[500px] bg-black border-2 border-signal
                     flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="border-b-2 border-signal p-4 shrink-0">
            <span className="text-signal text-sm tracking-widest font-bold">
              SIGNAL COACH
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-neutral text-xs tracking-wide text-center mt-8 leading-relaxed">
                ASK YOUR COACH ANYTHING.
                <br />
                YOUR DATA IS THE CONTEXT.
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'text-white border-l-2 border-white pl-3'
                    : 'text-signal border-l-2 border-signal pl-3'
                }`}
              >
                <div className="text-neutral text-[10px] tracking-widest mb-1">
                  {msg.role === 'user' ? 'YOU' : 'COACH'}
                </div>
                <div className="whitespace-pre-wrap">
                  {msg.content}
                  {msg.role === 'assistant' && isLoading && msg.content === '' && (
                    <span className="animate-pulse">_</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t-2 border-signal p-3 flex gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-white text-sm border-2 border-neutral
                         focus:border-signal outline-none px-3 py-2
                         placeholder:text-neutral disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-signal text-black border-2 border-signal text-xs font-bold tracking-wide
                         hover:bg-transparent hover:text-signal transition-colors duration-150
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              SEND
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
