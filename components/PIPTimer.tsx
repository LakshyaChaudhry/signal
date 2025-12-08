'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTimer } from '@/lib/timer-context'

interface PIPTimerProps {
  onStop: () => Promise<void>
  onMaximize: () => void
}

const MIN_WIDTH = 120
const MIN_HEIGHT = 60
const MAX_WIDTH = 300
const MAX_HEIGHT = 200

export default function PIPTimer({ onStop, onMaximize }: PIPTimerProps) {
  const { formattedTime, isPaused } = useTimer()
  const [position, setPosition] = useState(() => {
    // Load position from localStorage
    const saved = localStorage.getItem('signal_pip_position')
    return saved ? JSON.parse(saved) : { x: 20, y: window.innerHeight - 200 }
  })
  const [size, setSize] = useState(() => {
    // Load size from localStorage
    const saved = localStorage.getItem('signal_pip_size')
    return saved ? JSON.parse(saved) : { width: 180, height: 80 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const pipRef = useRef<HTMLDivElement>(null)

  // Save position and size to localStorage
  useEffect(() => {
    localStorage.setItem('signal_pip_position', JSON.stringify(position))
  }, [position])

  useEffect(() => {
    localStorage.setItem('signal_pip_size', JSON.stringify(size))
  }, [size])

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x))
      const newY = Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
      
      setPosition({ x: newX, y: newY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  // Handle resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleResize = (e: MouseEvent) => {
    if (isResizing) {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, size.width + deltaX))
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, size.height + deltaY))
      
      setSize({ width: newWidth, height: newHeight })
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  // Setup mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, size])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleResize)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, dragStart, size])

  const fontSize = Math.max(12, Math.min(24, size.width / 8))

  return (
    <motion.div
      ref={pipRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed bg-black border-2 border-deep shadow-2xl cursor-move select-none z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Content */}
      <div className="h-full flex flex-col items-center justify-center p-2 space-y-1">
        {/* Status */}
        {size.height > 70 && (
          <div className="text-neutral text-[10px] tracking-widest">
            {isPaused ? 'PAUSED' : 'TRACKING'}
          </div>
        )}
        
        {/* Timer */}
        <div 
          className="text-deep font-bold tracking-tight"
          style={{ fontSize: `${fontSize}px` }}
        >
          {formattedTime}
        </div>
        
        {/* Controls */}
        {size.height > 80 && (
          <div className="flex gap-1 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStop()
              }}
              className="px-2 py-1 text-[10px] border border-white text-white hover:bg-white hover:text-black transition-colors"
            >
              STOP
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMaximize()
              }}
              className="px-2 py-1 text-[10px] border border-neutral text-neutral hover:bg-neutral hover:text-black transition-colors"
            >
              MAX
            </button>
          </div>
        )}
      </div>
      
      {/* Resize Handle */}
      <div
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeStart}
        style={{
          borderRight: '2px solid #0EA5E9',
          borderBottom: '2px solid #0EA5E9',
        }}
      />
    </motion.div>
  )
}

