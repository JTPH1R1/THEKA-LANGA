import { supabase, db, schemaRpc } from '@/lib/supabase'

export interface KycProfileData {
  profileId: string
  kycLevel: number
  verificationStatus: string
  dateOfBirth: string | null
  gender: string | null
  nationality: string | null
  level1CompletedAt: string | null
  level2CompletedAt: string | null
  level3CompletedAt: string | null
  riskRating: string
  submittedAt: string | null
}

export interface KycDocumentData {
  id: string
  docType: string
  docNumber: string
  issuingCountry: string
  docFullName: string
  frontImagePath: string
  backImagePath: string | null
  expiryDate: string | null
  status: string
  rejectionReason: string | null
  isPrimary: boolean
  createdAt: string
}

export interface KycSelfieData {
  id: string
  imagePath: string
  status: string
  rejectionReason: string | null
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.toLowerCase().trim())
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function uploadKycFile(
  profileId: string,
  folder: string,
  fileName: string,
  file: File
): Promise<string> {
  const path = `${profileId}/${folder}/${fileName}`
  const { error } = await supabase.storage
    .from('kyc-docs')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw { message: error.message }
  return path
}

export async function getMyKycProfile(): Promise<KycProfileData | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { data, error } = await db.kyc()
    .from('profiles')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle()

  if (error) throw { message: error.message }
  if (!data) return null

  return {
    profileId: data.profile_id,
    kycLevel: data.kyc_level,
    verificationStatus: data.verification_status,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    nationality: data.nationality,
    level1CompletedAt: data.level1_completed_at,
    level2CompletedAt: data.level2_completed_at,
    level3CompletedAt: data.level3_completed_at,
    riskRating: data.risk_rating,
    submittedAt: data.submitted_at,
  }
}

export async function completeLevel1(params: {
  dateOfBirth: string
  gender: string
  nationality: string
}): Promise<void> {
  const { error } = await schemaRpc('kyc', 'complete_level1', {
    p_date_of_birth: params.dateOfBirth,
    p_gender: params.gender,
    p_nationality: params.nationality,
  })
  if (error) throw { message: error.message }
}

export async function submitLevel2(params: {
  docType: string
  docNumber: string
  issuingCountry: string
  docFullName: string
  expiryDate?: string
  frontImage: File
  backImage?: File
  selfieImage: File
  nokFullName: string
  nokRelationship: string
  nokPhone: string
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const docId = crypto.randomUUID()
  const selfieId = crypto.randomUUID()
  const docHash = await sha256(params.docNumber)

  // Upload images in parallel
  const ext = (f: File) => f.name.split('.').pop() ?? 'jpg'
  const [frontPath, selfiePath, backPath] = await Promise.all([
    uploadKycFile(user.id, 'id', `${docId}_front.${ext(params.frontImage)}`, params.frontImage),
    uploadKycFile(user.id, 'selfie', `${selfieId}.${ext(params.selfieImage)}`, params.selfieImage),
    params.backImage
      ? uploadKycFile(user.id, 'id', `${docId}_back.${ext(params.backImage)}`, params.backImage)
      : Promise.resolve(null),
  ])

  // Insert identity document
  const { error: docError } = await db.kyc()
    .from('identity_documents')
    .insert({
      id: docId,
      profile_id: user.id,
      doc_type: params.docType,
      doc_number: params.docNumber,
      doc_number_hash: docHash,
      issuing_country: params.issuingCountry,
      doc_full_name: params.docFullName,
      expiry_date: params.expiryDate ?? null,
      front_image_path: frontPath,
      back_image_path: backPath,
      is_primary: true,
      status: 'pending',
    })
  if (docError) throw { message: docError.message }

  // Insert selfie
  const { error: selfieError } = await db.kyc()
    .from('selfies')
    .insert({
      id: selfieId,
      profile_id: user.id,
      image_path: selfiePath,
      status: 'pending',
    })
  if (selfieError) throw { message: selfieError.message }

  // Insert next of kin
  const { error: nokError } = await db.kyc()
    .from('next_of_kin')
    .insert({
      profile_id: user.id,
      full_name: params.nokFullName,
      relationship: params.nokRelationship,
      phone: params.nokPhone,
      is_primary: true,
    })
  if (nokError) throw { message: nokError.message }

  const { error: rpcError } = await schemaRpc('kyc', 'submit_level2', {
    p_doc_id: docId,
    p_selfie_id: selfieId,
  })
  if (rpcError) throw { message: rpcError.message }
}

export async function submitLevel3(params: {
  addressLine1: string
  addressLine2?: string
  city: string
  countyProvince?: string
  postalCode?: string
  country: string
  proofDocType: string
  proofPeriod: string
  proofImage: File
  employmentStatus: string
  monthlyIncomeBand: string
  sourceOfFunds: string[]
  taxIdNumber?: string
  isPep: boolean
  usPerson: boolean
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const addressId = crypto.randomUUID()
  const ext = params.proofImage.name.split('.').pop() ?? 'jpg'
  const proofPath = await uploadKycFile(
    user.id, 'address', `${addressId}_proof.${ext}`, params.proofImage
  )

  const { error: addrError } = await db.kyc()
    .from('addresses')
    .insert({
      id: addressId,
      profile_id: user.id,
      address_type: 'residential',
      line1: params.addressLine1,
      line2: params.addressLine2 ?? null,
      city: params.city,
      county_province: params.countyProvince ?? null,
      postal_code: params.postalCode ?? null,
      country: params.country,
      proof_doc_type: params.proofDocType,
      proof_period: params.proofPeriod,
      proof_image_path: proofPath,
      is_primary: true,
      status: 'pending',
    })
  if (addrError) throw { message: addrError.message }

  const { error: finError } = await db.kyc()
    .from('financial_declarations')
    .upsert({
      profile_id: user.id,
      employment_status: params.employmentStatus,
      monthly_income_band: params.monthlyIncomeBand,
      source_of_funds: params.sourceOfFunds,
      tax_id_number: params.taxIdNumber ?? null,
      is_pep: params.isPep,
      us_person: params.usPerson,
      declaration_accepted: true,
      declaration_accepted_at: new Date().toISOString(),
    })
  if (finError) throw { message: finError.message }

  const { error: rpcError } = await schemaRpc('kyc', 'submit_level3', {
    p_address_id: addressId,
  })
  if (rpcError) throw { message: rpcError.message }
}

export async function getMyKycDocuments(): Promise<KycDocumentData[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw { message: 'Not authenticated' }

  const { data, error } = await db.kyc()
    .from('identity_documents')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw { message: error.message }
  return (data ?? []).map((d) => ({
    id: d.id,
    docType: d.doc_type,
    docNumber: d.doc_number,
    issuingCountry: d.issuing_country,
    docFullName: d.doc_full_name,
    frontImagePath: d.front_image_path,
    backImagePath: d.back_image_path,
    expiryDate: d.expiry_date,
    status: d.status,
    rejectionReason: d.rejection_reason,
    isPrimary: d.is_primary,
    createdAt: d.created_at,
  }))
}
