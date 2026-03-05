'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleRegister() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setError('ส่ง confirmation email แล้ว กรุณาตรวจสอบอีเมล')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm p-8 bg-slate-900 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-white mb-6">To Do List PJ</h1>
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        <input type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-indigo-500" />
        <input type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:border-indigo-500" />
        <button onClick={handleLogin} disabled={loading}
          className="w-full mb-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg disabled:opacity-50">
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
        <button onClick={handleRegister} disabled={loading}
          className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg disabled:opacity-50">
          สมัครสมาชิก
        </button>
      </div>
    </div>
  )
}