import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Called after any financial event to recalculate credit score.
// Payload: { profile_id: string, event_type: string, reference_id?: string }
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profile_id, event_type, reference_id } = await req.json()

    if (!profile_id || !event_type) {
      return new Response(JSON.stringify({ error: 'profile_id and event_type required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Score deltas — mirror of src/lib/calculations/credit-score.ts SCORE_DELTAS
    const SCORE_DELTAS: Record<string, number> = {
      on_time_contribution:     2,
      late_contribution:       -5,
      fine_paid:              -10,
      instalment_on_time:       5,
      instalment_missed:       -20,
      loan_completed:          10,
      formal_default:         -50,
      blacklist_event:        -100,
      early_group_exit:        -15,
      active_month:             1,
      kyc_level_upgrade:       15,
    }

    const delta = SCORE_DELTAS[event_type] ?? 0
    if (delta === 0) {
      return new Response(JSON.stringify({ ok: true, message: 'no score change for event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Read current score
    const { data: profile, error: profileErr } = await supabase
      .schema('core')
      .from('profiles')
      .select('credit_score')
      .eq('id', profile_id)
      .single()

    if (profileErr || !profile) {
      throw new Error(`Profile not found: ${profileErr?.message}`)
    }

    const score_before = profile.credit_score
    const score_after  = Math.min(850, Math.max(300, score_before + delta))

    // Update profile score
    await supabase
      .schema('core')
      .from('profiles')
      .update({ credit_score: score_after })
      .eq('id', profile_id)

    // Append to history
    await supabase
      .schema('audit')
      .from('credit_score_history')
      .insert({
        profile_id,
        score_before,
        score_after,
        event_type,
        reference_id: reference_id ?? null,
      })

    return new Response(JSON.stringify({ ok: true, score_before, score_after, delta }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
