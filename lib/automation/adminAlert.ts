import type { ScanAgent } from '@/lib/ai/extractOpportunity'
import { getAppUrlFromRequest } from '@/lib/runtime-url'
import { sendMailgunMessage } from '@/lib/reminders/mailgun'

type DraftSummary = {
  title: string
  source_url: string
  deadline: string | null
}

type NotifyParams = {
  request: Request
  admin: any
  agent: ScanAgent
  drafts: DraftSummary[]
}

function getRecipientEmails(raw: string) {
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

async function resolveRecipients(admin: any) {
  const fromEnv = getRecipientEmails(String(process.env.AI_DRAFT_ALERT_EMAILS || '').trim())
  if (fromEnv.length > 0) return fromEnv

  const { data } = await admin.from('admin_users').select('email').limit(5)
  const fromDb = Array.isArray(data) ? data.map((row: any) => String(row?.email || '').trim()).filter(Boolean) : []
  return fromDb
}

function toAgentLabel(agent: ScanAgent) {
  if (agent === 'elite_foundation_scan') return 'Elite Foundation Scan'
  return 'Global Institutional Scan'
}

export async function notifyAdminsOnNewDrafts(params: NotifyParams) {
  const { request, admin, agent, drafts } = params
  if (!Array.isArray(drafts) || drafts.length === 0) {
    return { sent: false, reason: 'no_new_drafts' }
  }

  const recipients = await resolveRecipients(admin)
  if (recipients.length === 0) {
    return { sent: false, reason: 'no_recipients' }
  }

  const appUrl = getAppUrlFromRequest(request)
  const reviewUrl = `${appUrl}/admin/drafts`
  const today = new Date().toISOString().slice(0, 10)
  const maxRows = drafts.slice(0, 10)

  const rowsText = maxRows
    .map((draft, index) => {
      const deadline = draft.deadline ? ` | Deadline: ${draft.deadline}` : ''
      return `${index + 1}. ${draft.title}${deadline}\n   ${draft.source_url}`
    })
    .join('\n')

  const moreCount = drafts.length - maxRows.length
  const moreLine = moreCount > 0 ? `\n...and ${moreCount} more.` : ''

  const subject = `[GF] ${drafts.length} new draft opportunit${drafts.length === 1 ? 'y' : 'ies'} to review (${toAgentLabel(agent)})`
  const text = [
    `Date: ${today}`,
    `Scanner: ${toAgentLabel(agent)}`,
    `New drafts: ${drafts.length}`,
    '',
    rowsText,
    moreLine,
    '',
    `Review now: ${reviewUrl}`
  ]
    .filter(Boolean)
    .join('\n')

  const htmlRows = maxRows
    .map((draft) => {
      const deadline = draft.deadline ? ` <span style=\"color:#475569;\">(Deadline: ${draft.deadline})</span>` : ''
      return `<li style=\"margin:0 0 8px;\"><strong>${draft.title}</strong>${deadline}<br /><a href=\"${draft.source_url}\" style=\"color:#0f766e;\">${draft.source_url}</a></li>`
    })
    .join('')

  const htmlMore = moreCount > 0 ? `<p style=\"margin:14px 0 0;color:#475569;\">...and ${moreCount} more.</p>` : ''

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:0 auto;padding:20px;background:#f8fafc;color:#0f172a;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
      <h2 style="margin:0 0 12px;font-size:20px;">New Draft Opportunities Need Approval</h2>
      <p style="margin:0 0 12px;color:#334155;">Scanner: <strong>${toAgentLabel(agent)}</strong><br />Date: ${today}<br />New drafts: <strong>${drafts.length}</strong></p>
      <ol style="padding-left:20px;margin:0;">${htmlRows}</ol>
      ${htmlMore}
      <p style="margin:18px 0 0;"><a href="${reviewUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:10px 14px;border-radius:8px;font-weight:700;">Review Drafts</a></p>
    </div>
  </div>`

  for (const to of recipients) {
    await sendMailgunMessage({
      to,
      subject,
      text,
      html,
      tags: ['automation-drafts', 'admin-review-alert']
    })
  }

  return { sent: true, recipients }
}
