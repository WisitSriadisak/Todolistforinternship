'use client'
import { useState } from 'react'
import { Copy, Check, UserPlus, X, Users } from 'lucide-react'
import { useFriends } from '@/lib/hooks/useFriends'
import Header from '@/components/layout/Header'

const AVATAR_COLORS = ['#6366f1','#ec4899','#14b8a6','#f59e0b','#8b5cf6','#10b981','#ef4444','#3b82f6']

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <span
      className="rounded-full flex items-center justify-center text-white font-bold shrink-0"
      style={{ backgroundColor: bg, width: size, height: size, fontSize: size * 0.4 }}
    >
      {name[0]?.toUpperCase() ?? '?'}
    </span>
  )
}

export default function FriendsPage() {
  const {
    friends, pendingReceived, pendingSent, myProfile, loading,
    sendFriendRequest, acceptRequest, rejectRequest, removeFriend,
  } = useFriends()

  const [addOpen, setAddOpen] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  function copyCode() {
    if (!myProfile?.friend_code) return
    navigator.clipboard.writeText(myProfile.friend_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleAddFriend() {
    if (!codeInput.trim()) return
    setSubmitting(true)
    setAddError('')
    const { error } = await sendFriendRequest(codeInput)
    if (error) {
      setAddError(error)
    } else {
      setAddSuccess(true)
      setCodeInput('')
      setTimeout(() => { setAddSuccess(false); setAddOpen(false) }, 1500)
    }
    setSubmitting(false)
  }

  return (
    <>
      <Header title="เพื่อน" />
      <div className="p-6 max-w-2xl mx-auto space-y-6">

        {/* My Friend Code Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6">
          <p className="text-sm font-medium text-[#6366f1] mb-1">รหัสเพื่อนของคุณ</p>
          <p className="text-xs text-[#64748b] mb-4">แชร์รหัสนี้ให้เพื่อนนำไปใส่เพื่อส่งคำขอเพื่อน</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-white border-2 border-indigo-200 rounded-xl px-5 py-3">
              <p className="text-2xl font-bold tracking-[0.3em] text-[#0f172a] font-mono">
                {loading ? '--------' : (myProfile?.friend_code ?? '--------')}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-2 px-4 py-3 bg-[#6366f1] text-white rounded-xl font-medium text-sm hover:bg-indigo-600 transition-colors"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'คัดลอกแล้ว\!' : 'คัดลอก'}
            </button>
          </div>
        </div>

        {/* Add Friend Button */}
        <button
          onClick={() => { setAddOpen(true); setAddError(''); setAddSuccess(false) }}
          className="flex items-center gap-2 w-full px-4 py-3 border-2 border-dashed border-[#e2e8f0] rounded-xl text-sm font-medium text-[#64748b] hover:border-[#6366f1] hover:text-[#6366f1] transition-colors"
        >
          <UserPlus size={18} />
          เพิ่มเพื่อนด้วยรหัส
        </button>

        {/* Pending Received Requests */}
        {pendingReceived.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[#334155] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              คำขอเพื่อนที่รอตอบรับ ({pendingReceived.length})
            </h2>
            <div className="space-y-2">
              {pendingReceived.map((req) => {
                const p = req.requester
                const name = p?.display_name || p?.email?.split('@')[0] || 'ไม่ทราบชื่อ'
                return (
                  <div key={req.id} className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <Avatar name={name} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0f172a] truncate">{name}</p>
                      <p className="text-xs text-[#94a3b8] truncate">{p?.email}</p>
                    </div>
                    <button onClick={() => acceptRequest(req.id)} className="px-3 py-1.5 bg-[#6366f1] text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors">
                      รับเพื่อน
                    </button>
                    <button onClick={() => rejectRequest(req.id)} className="p-1.5 text-[#94a3b8] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                      <X size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Pending Sent Requests */}
        {pendingSent.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-[#334155] mb-3">คำขอที่ส่งออก ({pendingSent.length})</h2>
            <div className="space-y-2">
              {pendingSent.map((req) => {
                const p = req.receiver
                const name = p?.display_name || p?.email?.split('@')[0] || 'ไม่ทราบชื่อ'
                return (
                  <div key={req.id} className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 opacity-80">
                    <Avatar name={name} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0f172a] truncate">{name}</p>
                      <p className="text-xs text-[#94a3b8] truncate">{p?.email}</p>
                    </div>
                    <span className="text-xs text-[#94a3b8] bg-slate-100 px-2 py-1 rounded-lg">รอตอบรับ...</span>
                    <button onClick={() => rejectRequest(req.id)} className="p-1.5 text-[#94a3b8] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="ยกเลิกคำขอ">
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div>
          <h2 className="text-sm font-semibold text-[#334155] mb-3 flex items-center gap-2">
            <Users size={15} /> เพื่อนทั้งหมด ({friends.length})
          </h2>
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8] border border-dashed border-[#e2e8f0] rounded-xl">
              <Users size={32} className="mb-2 opacity-40" />
              <p className="text-sm font-medium">ยังไม่มีเพื่อน</p>
              <p className="text-xs mt-1">คัดลอกรหัสแล้วแชร์ให้เพื่อน หรือกดเพิ่มเพื่อนด้วยรหัสด้านบน</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map(({ requestId, profile }) => {
                const name = profile.display_name || profile.email.split('@')[0]
                return (
                  <div key={requestId} className="flex items-center gap-3 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3">
                    <Avatar name={name} size={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#0f172a] truncate">{name}</p>
                      <p className="text-xs text-[#94a3b8] truncate">{profile.email}</p>
                    </div>
                    <span className="text-xs font-mono text-[#64748b] bg-slate-100 px-2 py-1 rounded-lg">{profile.friend_code}</span>
                    <button onClick={() => removeFriend(requestId)} className="p-1.5 text-[#94a3b8] hover:text-red-500 transition-colors rounded-lg hover:bg-red-50" title="ลบเพื่อน">
                      <X size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Friend Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setAddOpen(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="text-lg font-bold text-[#0f172a]">เพิ่มเพื่อน</h2>
              <button onClick={() => setAddOpen(false)} className="text-[#94a3b8] hover:text-[#0f172a]">X<X size={20} />X</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-[#64748b]">ใส่รหัสเพื่อนของอีกฝ่าย (8 ตัวอักษร)</p>
              <input
                value={codeInput}
                onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setAddError('') }}
                placeholder="เช่น A3B7F2C9"
                maxLength={8}
                className="w-full px-4 py-3 text-center text-xl font-mono tracking-[0.25em] font-bold border-2 border-[#e2e8f0] rounded-xl focus:outline-none focus:border-[#6366f1] text-[#0f172a] placeholder:text-[#cbd5e1] placeholder:font-normal placeholder:tracking-normal placeholder:text-base"
              />
              {addError && <p className="text-sm text-red-500 text-center">{addError}</p>}
              {addSuccess && <p className="text-sm text-green-500 text-center font-medium">ส่งคำขอเพื่อนแล้ว\!</p>}
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e2e8f0]">
              <button type="button" onClick={() => setAddOpen(false)} className="px-4 py-2 text-sm font-medium text-[#64748b] hover:text-[#0f172a]">ยกเลิก</button>
              <button onClick={handleAddFriend} disabled={submitting || codeInput.length < 6}
                className="px-5 py-2 bg-[#6366f1] text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-60">
                {submitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
