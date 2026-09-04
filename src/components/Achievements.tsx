import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { onUnlock } from '../lib/achievements'
import type { Toast } from '../lib/achievements'

export default function Achievements() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(
    () =>
      onUnlock((toast) => {
        setToasts((prev) => [...prev, toast])
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.key !== toast.key))
        }, 4200)
      }),
    [],
  )

  return (
    <div className="trophies" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.key}
            className="trophy"
            initial={{ opacity: 0, x: 40, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 40, transition: { duration: 0.3 } }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
          >
            <span className="trophy__icon">◆</span>
            <span className="trophy__body">
              <strong className="trophy__title">{t.title}</strong>
              <span className="trophy__note">{t.note}</span>
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
