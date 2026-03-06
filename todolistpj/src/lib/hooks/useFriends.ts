'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Friendship } from '@/types'

function generateFriendCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  code += '-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function useFriends() {
  const [myProfile, setMyProfile]           = useState<Profile | null>(null)
  const [friends, setFriends]               = useState<Friendship[]>([])
  const [pendingIncoming, setPendingIncoming] = useState<Friendship[]>([])
  const [pendingSent, setPendingSent]        = useState<Friendship[]>([])
  const [loading, setLoading]               = useState(true)
  const supabase = createClient()

  const ensureProfile = useCallback(async (): Promise<Profile | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existing) { setMyProfile(existing); return existing }

    const { data: created } = await supabase
      .from('profiles')
      .insert({ id: user.id, email: user.email, friend_code: generateFriendCode() })
      .select()
      .single()

    if (created) { setMyProfile(created); return created }
    return null
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchFriends = useCallback(async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data } = await supabase
      .from('friendships')
      .select(`
        id, requester_id, addressee_id, status, created_at,
        requester:profiles!friendships_requester_id_fkey(id,email,display_name,friend_code,created_at),
        addressee:profiles!friendships_addressee_id_fkey(id,email,display_name,friend_code,created_at)
      `)
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)

    const rows = data || []
    const getOther = (row: any): Profile =>
      row.requester_id === user.id ? row.addressee : row.requester

    setFriends(
      rows.filter(r => r.status === 'accepted').map(r => ({ ...r, profile: getOther(r) }))
    )
    setPendingIncoming(
      rows.filter(r => r.status === 'pending' && r.addressee_id === user.id)
          .map(r => ({ ...r, profile: r.requester }))
    )
    setPendingSent(
      rows.filter(r => r.status === 'pending' && r.requester_id === user.id)
          .map(r => ({ ...r, profile: r.addressee }))
    )
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    ensureProfile()
    fetchFriends()
  }, [ensureProfile, fetchFriends])

  async function addFriend(code: string): Promise<string | null> {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return 'กรุณาใส่รหัสเพื่อน'

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 'ไม่พบผู้ใช้'

    const { data: target } = await supabase
      .from('profiles')
      .select('*')
      .eq('friend_code', trimmed)
      .single()

    if (!target) return 'ไม่พบรหัสเพื่อนนี้'
    if (target.id === user.id) return 'ไม่สามารถเพิ่มตัวเองเป็นเพื่อนได้'

    const allExisting = [...friends, ...pendingSent, ...pendingIncoming]
    if (allExisting.some(f => f.profile?.id === target.id)) return 'มีคำขอหรือเป็นเพื่อนกันอยู่แล้ว'

    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: user.id, addressee_id: target.id, status: 'pending' })

    if (error) return 'เกิดข้อผิดพลาด กรุณาลองใหม่'
    fetchFriends()
    return null
  }

  async function acceptRequest(friendshipId: string) {
    await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    fetchFriends()
  }

  async function rejectRequest(friendshipId: string) {
    await supabase.from('friendships').update({ status: 'rejected' }).eq('id', friendshipId)
    fetchFriends()
  }

  async function removeFriend(friendshipId: string) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    fetchFriends()
  }

  async function updateDisplayName(name: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() || null })
      .eq('id', user.id)
      .select()
      .single()
    if (data) setMyProfile(data)
  }

  return {
    myProfile,
    friends,
    pendingIncoming,
    pendingSent,
    loading,
    addFriend,
    acceptRequest,
    rejectRequest,
    removeFriend,
    updateDisplayName,
    refetch: fetchFriends,
  }
}
