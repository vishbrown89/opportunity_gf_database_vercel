export type ReminderEmailOpportunity = {
  title: string;
  deadline: string;
  href: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shell(title: string, body: string) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#0f766e;color:#ffffff;">
                <div style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;opacity:.92;">Opportunities Growth Forum</div>
                <div style="font-size:22px;font-weight:700;line-height:1.25;margin-top:6px;">${escapeHtml(title)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">${body}</td>
            </tr>
            <tr>
              <td style="padding:14px 24px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px;line-height:1.5;">
                You are receiving this email because you subscribed to saved opportunity reminders.
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
      return `<tr>
  <td style="padding:14px 16px;border:1px solid #e2e8f0;border-radius:10px;background:#ffffff;display:block;margin-bottom:10px;">
    <div style="font-size:16px;font-weight:700;color:#0f172a;line-height:1.35;">${escapeHtml(opp.title)}</div>
    <div style="font-size:13px;color:#334155;margin-top:6px;">Deadline: <strong>${escapeHtml(opp.deadline || 'TBC')}</strong></div>
    <div style="margin-top:10px;">
      <a href="${escapeHtml(opp.href)}" style="display:inline-block;padding:8px 12px;border-radius:8px;background:#ecfeff;color:#0e7490;text-decoration:none;font-size:13px;font-weight:700;">View Opportunity</a>
    </div>
  </td>
</tr>`;
    })
    .join('');
}

export function buildSubscriptionConfirmationEmail(params: {
  unsubscribeUrl?: string;
  opportunities: ReminderEmailOpportunity[];
}) {
  const { unsubscribeUrl, opportunities } = params;
  const subject = 'You are subscribed to opportunity reminders';

  const textRows = opportunities
    .map((opp) => `- ${opp.title} (Deadline: ${opp.deadline || 'TBC'})\n  ${opp.href}`)
    .join('\n');

  const text = [
    'Your reminder settings are now active.',
    '',
    'We will email you before important deadlines from your saved opportunities.',
    '',
    textRows ? `Currently tracked opportunities:\n${textRows}` : 'No saved opportunities were found yet.',
    '',
    unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  const rowsHtml = opportunities.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderOpportunityRows(opportunities)}</table>`
    : `<p style="margin:14px 0 0;color:#475569;font-size:14px;line-height:1.6;">No saved opportunities were found yet.</p>`;

  const unsubscribeHtml = unsubscribeUrl
    ? `<p style="margin:18px 0 0;font-size:13px;color:#64748b;line-height:1.6;">If you no longer want these reminders, you can <a href="${escapeHtml(
        unsubscribeUrl
      )}" style="color:#0e7490;">unsubscribe here</a>.</p>`
    : '';

  const html = shell(
    'Subscription Confirmed',
    `<p style="margin:0;color:#334155;font-size:15px;line-height:1.7;">Your reminder settings are active. We will email you when your saved opportunities are approaching deadline.</p>
     <h3 style="margin:22px 0 10px;font-size:16px;color:#0f172a;">Currently tracked opportunities</h3>
     ${rowsHtml}
     ${unsubscribeHtml}`
  );

  return { subject, text, html };
}

export function buildDeadlineReminderEmail(params: {
  count: number;
  daysAhead: number;
  unsubscribeUrl?: string;
  opportunities: ReminderEmailOpportunity[];
}) {
  const { count, daysAhead, unsubscribeUrl, opportunities } = params;
  const subject = `Reminder: ${count} opportunity deadline${count === 1 ? '' : 's'} approaching`;

  const textRows = opportunities
    .map((opp) => `- ${opp.title}\n  Deadline: ${opp.deadline || 'TBC'}\n  ${opp.href}`)
    .join('\n');

  const text = [
    `You have ${count} saved opportunit${count === 1 ? 'y' : 'ies'} expiring in the next ${daysAhead} day${
      daysAhead === 1 ? '' : 's'
    }.`,
    '',
    textRows,
    '',
    unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  const html = shell(
    `Deadline Alert: ${count} ${count === 1 ? 'Opportunity' : 'Opportunities'}`,
    `<p style="margin:0;color:#334155;font-size:15px;line-height:1.7;">You have <strong>${count}</strong> saved opportunit${
      count === 1 ? 'y' : 'ies'
    } with deadlines in the next <strong>${daysAhead}</strong> day${daysAhead === 1 ? '' : 's'}.</p>
     <h3 style="margin:22px 0 10px;font-size:16px;color:#0f172a;">Expiring soon</h3>
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderOpportunityRows(opportunities)}</table>
     ${
       unsubscribeUrl
         ? `<p style="margin:18px 0 0;font-size:13px;color:#64748b;line-height:1.6;">To stop all reminder emails, <a href="${escapeHtml(
             unsubscribeUrl
           )}" style="color:#0e7490;">unsubscribe here</a>.</p>`
         : ''
     }`
  );

  return { subject, text, html };
}
