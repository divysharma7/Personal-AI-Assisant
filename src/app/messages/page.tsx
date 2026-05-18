'use client'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare size={48} style={{ color: 'var(--text-3)', margin: '0 auto 16px' }} />
          <h2 className="text-[20px] font-bold mb-2" style={{ color: 'var(--text-1)' }}>
            Messages
          </h2>
          <p className="text-[14px]" style={{ color: 'var(--text-3)' }}>
            Coming soon. Stay tuned for updates.
          </p>
        </div>
      </div>
    </div>
  )
}
