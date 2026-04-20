import { supabase, db } from '@/lib/supabase'
import type { Profile } from '@/types/domain.types'

function mapRow(row: {
  id: string
  email: string
  full_legal_name: string
  preferred_name: string | null
  phone: string | null
  phone_verified: boolean
  avatar_url: string | null
  system_role: string
  kyc_level: number
  credit_score: number
  credit_score_band: string | null
  is_blacklisted: boolean
  is_active: boolean
  timezone: string
  locale: string
  created_at: string
  updated_at: string
}): Profile {
  return {
    id: row.id,
    email: row.email,
    fullLegalName: row.full_legal_name,
    preferredName: row.preferred_name,
    phone: row.phone,
    phoneVerified: row.phone_verified,
    avatarUrl: row.avatar_url,
    systemRole: row.system_role as Profile['systemRole'],
    kycLevel: row.kyc_level as Profile['kycLevel'],
    creditScore: row.credit_score,
    creditScoreBand: (row.credit_score_band ?? 'fair') as Profile['creditScoreBand'],
    isBlacklisted: row.is_blacklisted,
    isActive: row.is_active,
    timezone: row.timezone,
    locale: row.locale,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getMyProfile(): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { data, error } = await db.core()
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw { message: error.message }
  return mapRow(data)
}

export async function updateMyProfile(updates: {
  preferredName?: string
  phone?: string | null
  timezone?: string
  locale?: string
}): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { data, error } = await db.core()
    .from('profiles')
    .update({
      preferred_name: updates.preferredName,
      phone: updates.phone ?? null,
      timezone: updates.timezone,
      locale: updates.locale,
    })
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) throw { message: error.message }
  return mapRow(data)
}

export async function uploadAvatar(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${user.id}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) throw { message: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

  const { data, error } = await db.core()
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)
    .select('*')
    .single()

  if (error) throw { message: error.message }
  return mapRow(data).avatarUrl!
}

export async function updateLastSeen(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await db.core()
    .from('profiles')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', user.id)
}
