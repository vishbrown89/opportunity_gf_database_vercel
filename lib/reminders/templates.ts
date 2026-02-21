export type ReminderEmailOpportunity = {
  title: string;
  deadline: string;
  href: string;
};

function escapeHtml(value: string) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toPrettyDate(value: string) {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return 'TBC';

  const dt = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(dt.getTime())) return 'TBC';

  return dt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function daysUntil(deadline: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return null;

  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const due = Date.parse(`${deadline}T00:00:00Z`);
  if (Number.isNaN(due)) return null;

  return Math.round((due - start) / (24 * 60 * 60 * 1000));
}

function deadlineBadge(deadline: string) {
  const days = daysUntil(deadline);
  if (days === null) {
    return {
      text: 'Deadline TBC',
      fg: '#0f766e',
      bg: '#ecfeff'
    };
  }

  if (days <= 3) {
    return {
      text: `${Math.max(days, 0)} day${Math.abs(days) === 1 ? '' : 's'} left`,
      fg: '#b91c1c',
      bg: '#fee2e2'
    };
  }

  if (days <= 10) {
    return {
      text: `${days} days left`,
      fg: '#b45309',
      bg: '#fef3c7'
    };
  }

  return {
    text: `${days} days left`,
    fg: '#166534',
    bg: '#dcfce7'
  };
}

function shell(params: {
  title: string;
  preheader: string;
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  body: string;
}) {
  const { title, preheader, eyebrow, heroTitle, heroSubtitle, body } = params;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#eef2f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;border-collapse:separate;overflow:hidden;border-radius:16px;border:1px solid #dbe3ef;background:#ffffff;box-shadow:0 6px 18px rgba(15,23,42,.06);">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(135deg,#0f766e,#0e7490);">
                <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#ccfbf1;font-weight:700;">${escapeHtml(eyebrow)}</div>
                <div style="margin-top:10px;font-size:26px;line-height:1.22;color:#ffffff;font-weight:800;">${escapeHtml(heroTitle)}</div>
                <div style="margin-top:8px;font-size:15px;line-height:1.6;color:#e6fffb;">${escapeHtml(heroSubtitle)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">${body}</td>
            </tr>
            <tr>
              <td style="padding:14px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.65;">
                Opportunities Growth Forum<br />
                You are receiving this email because you subscribed to saved opportunity alerts.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderOpportunityRows(opportunities: ReminderEmailOpportunity[]) {
  return opportunities
    .map((opp) => {
      const prettyDate = toPrettyDate(opp.deadline);
      const badge = deadlineBadge(opp.deadline);

      return `<tr>
  <td style="padding:0 0 12px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="font-size:16px;font-weight:700;line-height:1.35;color:#0f172a;">${escapeHtml(opp.title)}</div>
          <div style="margin-top:6px;font-size:13px;color:#475569;">Deadline: <strong>${escapeHtml(prettyDate)}</strong></div>
          <div style="margin-top:10px;">
            <span style="display:inline-block;padding:4px 10px;border-radius:999px;background:${badge.bg};color:${badge.fg};font-size:12px;font-weight:700;">${escapeHtml(
        badge.text
      )}</span>
          </div>
          <div style="margin-top:12px;">
            <a href="${escapeHtml(opp.href)}" style="display:inline-block;padding:9px 14px;border-radius:8px;background:#0f766e;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">View Opportunity</a>
          </div>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
    })
    .join('');
}

function renderInfoCard(title: string, description: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
  <tr>
    <td style="padding:14px 16px;">
      <div style="font-size:14px;font-weight:700;color:#0f172a;">${escapeHtml(title)}</div>
      <div style="margin-top:6px;font-size:13px;line-height:1.6;color:#475569;">${escapeHtml(description)}</div>
    </td>
  </tr>
</table>`;
}

export function buildSubscriptionConfirmationEmail(params: {
  unsubscribeUrl?: string;
  opportunities: ReminderEmailOpportunity[];
}) {
  const { unsubscribeUrl, opportunities } = params;
  const subject = 'Subscription confirmed: opportunity deadline alerts are active';

  const textRows = opportunities
    .map((opp) => `- ${opp.title} (Deadline: ${toPrettyDate(opp.deadline)})\n  ${opp.href}`)
    .join('\n');

  const text = [
    'Subscription confirmed.',
    '',
    'Your reminder alerts are now active for saved opportunities.',
    '',
    textRows ? `Currently tracked opportunities:\n${textRows}` : 'No saved opportunities are being tracked yet.',
    '',
    unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  const listHtml = opportunities.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderOpportunityRows(opportunities)}</table>`
    : renderInfoCard('No saved opportunities yet', 'Save at least one opportunity and we will start monitoring deadlines automatically.');

  const unsubscribeHtml = unsubscribeUrl
    ? `<p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">If you no longer want reminder emails, you can <a href="${escapeHtml(
        unsubscribeUrl
      )}" style="color:#0e7490;text-decoration:underline;">unsubscribe here</a>.</p>`
    : '';

  const html = shell({
    title: 'Subscription Confirmed',
    preheader: 'Your deadline reminder alerts are active.',
    eyebrow: 'Reminder Setup Complete',
    heroTitle: 'You are now subscribed',
    heroSubtitle: 'We will notify you ahead of important deadlines for your saved opportunities.',
    body: `${renderInfoCard(
      'What happens next',
      'You will receive reminders before deadlines based on your saved list. Keep your saved opportunities updated to receive the most relevant alerts.'
    )}
    <h3 style="margin:4px 0 10px;font-size:16px;color:#0f172a;">Currently tracked opportunities</h3>
    ${listHtml}
    ${unsubscribeHtml}`
  });

  return { subject, text, html };
}

export function buildDeadlineReminderEmail(params: {
  count: number;
  daysAhead: number;
  unsubscribeUrl?: string;
  opportunities: ReminderEmailOpportunity[];
}) {
  const { count, daysAhead, unsubscribeUrl, opportunities } = params;
  const subject = `Deadline alert: ${count} opportunit${count === 1 ? 'y' : 'ies'} approaching`;

  const textRows = opportunities
    .map((opp) => `- ${opp.title}\n  Deadline: ${toPrettyDate(opp.deadline)}\n  ${opp.href}`)
    .join('\n');

  const text = [
    `You have ${count} saved opportunit${count === 1 ? 'y' : 'ies'} with deadlines in the next ${daysAhead} day${
      daysAhead === 1 ? '' : 's'
    }.`,
    '',
    textRows,
    '',
    unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  const unsubscribeHtml = unsubscribeUrl
    ? `<p style="margin:16px 0 0;font-size:13px;color:#64748b;line-height:1.6;">To stop future reminder emails, <a href="${escapeHtml(
        unsubscribeUrl
      )}" style="color:#0e7490;text-decoration:underline;">unsubscribe here</a>.</p>`
    : '';

  const html = shell({
    title: 'Deadline Reminder',
    preheader: `${count} saved opportunit${count === 1 ? 'y has' : 'ies have'} approaching deadlines.`,
    eyebrow: 'Deadline Reminder',
    heroTitle: `${count} deadline${count === 1 ? '' : 's'} approaching`,
    heroSubtitle: `Action recommended within the next ${daysAhead} day${daysAhead === 1 ? '' : 's'}.`,
    body: `${renderInfoCard(
      'Action recommended',
      'Review these opportunities now to avoid missing submission deadlines. Confirm requirements and submission windows on the official source page.'
    )}
    <h3 style="margin:4px 0 10px;font-size:16px;color:#0f172a;">Expiring opportunities</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderOpportunityRows(opportunities)}</table>
    ${unsubscribeHtml}`
  });

  return { subject, text, html };
}
