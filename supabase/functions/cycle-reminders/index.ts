import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Scheduled daily. Finds pending contributions due within 3 days
// and creates in-app notifications for the relevant members.
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const started_at = new Date()
  let records_processed = 0

  try {
    // Find contributions due in the next 3 days that are still pending
    const { data: upcoming, error } = await supabase
      .schema('finance')
      .from('contributions')
      .select('id, group_id, member_id, due_date, expected_amount')
      .in('status', ['pending', 'partial'])
      .gte('due_date', new Date().toISOString().split('T')[0])
      .lte('due_date', new Date(Date.now() + 3 * 86400_000).toISOString().split('T')[0])

    if (error) throw error

    if (upcoming && upcoming.length > 0) {
      const notifications = upcoming.map((c) => ({
        recipient_id: c.member_id,
        group_id: c.group_id,
        type: 'contribution_due',
        priority: 'normal',
        title: 'Contribution Due Soon',
        body: `Your contribution of KES ${(c.expected_amount / 100).toLocaleString()} is due on ${c.due_date}.`,
        action_url: `/groups/${c.group_id}/contributions`,
        data: { contribution_id: c.id, due_date: c.due_date },
      }))

      await supabase.schema('system').from('notifications').insert(notifications)
      records_processed = notifications.length
    }

    const duration_ms = Date.now() - started_at.getTime()

    await supabase.schema('system').from('job_log').insert({
      job_name: 'cycle-reminders',
      status: 'completed',
      started_at: started_at.toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms,
      records_processed,
    })

    return new Response(JSON.stringify({ ok: true, records_processed, duration_ms }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    await supabase.schema('system').from('job_log').insert({
      job_name: 'cycle-reminders',
      status: 'failed',
      started_at: started_at.toISOString(),
      error_message: String(err),
      records_processed,
    })

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
