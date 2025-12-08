'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="w-full max-w-md border-2 border-signal bg-black p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-3">
              <div className="text-signal text-sm tracking-widest">
                {title}
              </div>
              <div className="text-white text-base leading-relaxed">
                {message}
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={onCancel}
                className="px-6 py-3 text-neutral border-2 border-neutral hover:text-white hover:border-white transition-colors duration-150"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-3 bg-signal text-black border-2 border-signal hover:bg-transparent hover:text-signal transition-colors duration-150"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

