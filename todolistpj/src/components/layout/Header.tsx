'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  title: string
  userEmail?: string
}

export default function Header({ title, userEmail: emailProp }: Props) {
  const [email, setEmail] = useState(emailProp || '')

  useEffect(() => {
    if (!emailProp) {
      createClient().auth.getUser().then(({ data: { user } }) => {
        setEmail(user?.email || '')
      })
    }
  }, [emailProp])

  const initial = email?.[0]?.toUpperCase() || 'U'

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e2e8f0] sticky top-0 z-20">
      <h1 className="text-xl font-bold text-[#0f172a]">{title}</h1>
      <div
        className="w-9 h-9 rounded-full bg-[#6366f1] flex items-center justify-center text-white font-bold text-sm shrink-0"
        title={email}
      >
        {initial}
      </div>
    </header>
  )
}
