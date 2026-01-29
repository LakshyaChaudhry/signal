'use client'

import { motion } from 'framer-motion'
import { useChat } from '@/lib/chat-context'

export default function AIChatButton() {
  const { isOpen, toggleChat } = useChat()

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      onClick={toggleChat}
      className="fixed bottom-8 right-8 z-40 px-4 py-3 bg-signal text-black border-2 border-signal
                 hover:bg-transparent hover:text-signal transition-colors duration-150
                 flex items-center justify-center text-xs font-bold tracking-wider"
    >
      {isOpen ? '✕ CLOSE' : 'SIGNAL COACH'}
    </motion.button>
  )
}
