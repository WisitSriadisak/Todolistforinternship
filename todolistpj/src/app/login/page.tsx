'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin() {
    setLoading(true); setMessage(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setMessage({ text: error.message, type: 'error' }); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleRegister() {
    setLoading(true); setMessage(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setMessage({ text: error.message, type: 'error' }); setLoading(false); return }
    setMessage({ text: 'ส่ง confirmation email แล้ว กรุณาตรวจสอบอีเมล', type: 'success' })
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0f172a]">To Do List</h1>
          <p className="text-sm font-semibold text-[#6366f1] mt-0.5">By Wisit</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm p-8">
          <h2 className="text-lg font-semibold text-[#0f172a] mb-6">เข้าสู่ระบบ / สมัครสมาชิก</h2>

          {/* Message */}
          {message && (
            <div
              className={`text-sm px-4 py-3 rounded-lg mb-5 ${
                message.type === 'error'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Email */}
          <label className="block text-xs font-medium text-[#334155] mb-1">อีเมล</label>
          <input
            type="email"
            placeholder="example@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full mb-4 px-4 py-2.5 rounded-lg bg-white text-[#0f172a] border border-[#e2e8f0] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-indigo-100 text-sm transition"
          />

          {/* Password */}
          <label className="block text-xs font-medium text-[#334155] mb-1">รหัสผ่าน</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="w-full mb-6 px-4 py-2.5 rounded-lg bg-white text-[#0f172a] border border-[#e2e8f0] focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-indigo-100 text-sm transition"
          />

          {/* Buttons */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mb-3 py-2.5 bg-[#6366f1] hover:bg-indigo-500 text-white font-semibold rounded-lg disabled:opacity-50 text-sm transition-colors"
          >
            {loading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
          </button>
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-[#334155] font-semibold rounded-lg border border-[#e2e8f0] disabled:opacity-50 text-sm transition-colors"
          >
            สมัครสมาชิก
          </button>

          {/* Note */}
          <p className="mt-5 text-xs text-[#94a3b8] text-center leading-relaxed">
            หมายเหตุ: โปรดใช้อีเมลจริง แล้วกดสมัคร<br />
            ระบบจะส่งอีเมลยืนยันตัวตนจาก Supabase ไปให้
          </p>
        </div>
      </div>
    </div>
  )
}
