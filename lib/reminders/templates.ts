export type ReminderEmailOpportunity = {
  title: string;
  deadline: string;
  href: string;
};

type EmailBaseParams = {
  unsubscribeUrl?: string;
  opportunities: ReminderEmailOpportunity[];
  suggestedOpportunities?: ReminderEmailOpportunity[];
  newsletterUrl?: string;
  reminderLeadDays?: number;
};

const LOGO_TOP =
  'https://growthforum.my/wp-content/uploads/2025/04/320x132-growth-forum-logo.png';
const LOGO_BOTTOM =
  'https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-3.png';
const LINKEDIN_URL = 'https://my.linkedin.com/company/growthforummy';

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
    return { text: 'Deadline TBC', fg: '#0f766e', bg: '#ecfeff' };
  }

  if (days <= 3) {
    return { text: `${Math.max(days, 0)} day${Math.abs(days) === 1 ? '' : 's'} left`, fg: '#b91c1c', bg: '#fee2e2' };
  }

  if (days <= 10) {
    return { text: `${days} days left`, fg: '#b45309', bg: '#fef3c7' };
  }

  return { text: `${days} days left`, fg: '#166534', bg: '#dcfce7' };
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
              <td style="padding:22px 24px 10px;background:#ffffff;text-align:center;border-bottom:1px solid #e2e8f0;">
                <img src="${LOGO_TOP}" alt="Growth Forum" style="height:44px;max-width:220px;width:auto;display:inline-block;" />
              </td>
            </tr>
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
              <td style="padding:16px 24px 8px;text-align:center;border-top:1px solid #e2e8f0;">
                <img src="${LOGO_BOTTOM}" alt="Growth Forum" style="height:36px;max-width:210px;width:auto;display:inline-block;" />
              </td>
            </tr>
            <tr>
              <td style="padding:8px 24px 16px;color:#64748b;font-size:12px;line-height:1.65;text-align:center;">
                Opportunities Growth Forum<br />
                You are receiving this email because you subscribed to opportunity alerts.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderSuggestedSection(suggested: ReminderEmailOpportunity[]) {
  if (!suggested.length) return '';

  return `
    <h3 style="margin:20px 0 10px;font-size:16px;color:#0f172a;">More key opportunities for you</h3>
    <p style="margin:0 0 10px;font-size:13px;line-height:1.6;color:#475569;">Open these pages and click <strong>Get notified</strong> there if you want alerts for them too.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      ${suggested
        .map(
          (opp) => `<tr>
            <td style="padding:0 0 8px;">
              <a href="${escapeHtml(opp.href)}" style="display:block;padding:10px 12px;border:1px solid #dbeafe;border-radius:10px;background:#f8fbff;color:#0e7490;text-decoration:none;">
                <div style="font-size:14px;font-weight:700;line-height:1.35;">${escapeHtml(opp.title)}</div>
                <div style="font-size:12px;color:#64748b;margin-top:4px;">Deadline: ${escapeHtml(toPrettyDate(opp.deadline))}</div>
              </a>
            </td>
          </tr>`
        )
        .join('')}
    </table>
  `;
}

function renderNewsletterSection(newsletterUrl: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 0;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="font-size:14px;font-weight:700;color:#0f172a;">Subscribe for constant updates</div>
          <div style="margin-top:6px;font-size:13px;line-height:1.6;color:#475569;">Get ongoing curated funding and opportunity updates in your inbox.</div>
          <div style="margin-top:10px;">
            <a href="${escapeHtml(newsletterUrl)}" style="display:inline-block;padding:9px 14px;border-radius:8px;background:#1d4ed8;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">Subscribe to Newsletter</a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

function renderLinkedInSection() {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px 0 0;border:1px solid #e2e8f0;border-radius:12px;background:#ffffff;">
      <tr>
        <td style="padding:14px 16px;">
          <div style="font-size:14px;font-weight:700;color:#0f172a;">Follow us on LinkedIn</div>
          <div style="margin-top:6px;font-size:13px;line-height:1.6;color:#475569;">Get real-time updates, opportunities, and announcements from Growth Forum.</div>
          <div style="margin-top:10px;">
            <a href="${LINKEDIN_URL}" style="display:inline-flex;align-items:center;padding:9px 14px;border-radius:8px;background:#0A66C2;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;">
              <span style="display:inline-block;width:16px;height:16px;line-height:16px;text-align:center;background:#ffffff;color:#0A66C2;border-radius:2px;font-size:12px;font-weight:800;margin-right:8px;font-family:Arial,Helvetica,sans-serif;">in</span>
              Visit our LinkedIn profile
            </a>
          </div>
        </td>
      </tr>
    </table>
  `;
}

export function buildSubscriptionConfirmationEmail(params: EmailBaseParams) {
  const { unsubscribeUrl, opportunities, suggestedOpportunities = [], newsletterUrl = 'https://growthforum.my/newsletter/', reminderLeadDays = 3 } = params;
  const subject = 'Subscription confirmed: opportunity deadline alerts are active';

  const textRows = opportunities
    .map((opp) => `- ${opp.title} (Deadline: ${toPrettyDate(opp.deadline)})\n  ${opp.href}`)
    .join('\n');

  const textSuggested = suggestedOpportunities
    .map((opp) => `- ${opp.title} (Deadline: ${toPrettyDate(opp.deadline)})\n  ${opp.href}`)
    .join('\n');

  const text = [
    'Subscription confirmed.',
    '',
    'You will receive deadline alerts for the opportunity you selected.',
    `We will notify you ${reminderLeadDays} day${reminderLeadDays === 1 ? '' : 's'} before deadline.`,
    ,
    '',
    textRows ? `Currently tracked opportunities:\n${textRows}` : 'No tracked opportunities found.',
    '',
    textSuggested ? `More key opportunities to check:\n${textSuggested}` : '',
    '',
    `Subscribe to newsletter for constant updates: ${newsletterUrl}`,
    `Follow us on LinkedIn: ${LINKEDIN_URL}`,
    '',
    unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : ''
  ]
    .filter(Boolean)
    .join('\n');

  const listHtml = opportunities.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderOpportunityRows(opportunities)}</table>`
    : renderInfoCard('No tracked opportunities found', 'Please click Get notified on an opportunity page to start tracking deadlines.');

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
    heroSubtitle: 'We will notify you ahead of important deadlines for the opportunities you choose.',
    body: `${renderInfoCard(
      'What happens next',
      `We track the selected opportunity and notify you ${reminderLeadDays} day${reminderLeadDays === 1 ? '' : 's'} before its deadline. You can add more by clicking Get notified on other opportunity pages.`
    )}
    <h3 style="margin:4px 0 10px;font-size:16px;color:#0f172a;">Your tracked opportunities</h3>
    ${listHtml}
    ${renderSuggestedSection(suggestedOpportunities)}
    ${renderNewsletterSection(newsletterUrl)}
    ${renderLinkedInSection()}
    ${unsubscribeHtml}`
  });

  return { subject, text, html };
}

export function buildDeadlineReminderEmail(params: {
  count: number;
  daysAhead: number;
} & EmailBaseParams) {
  const { count, daysAhead, unsubscribeUrl, opportunities, suggestedOpportunities = [], newsletterUrl = 'https://growthforum.my/newsletter/' } = params;
  const subject = `Deadline alert: ${count} opportunit${count === 1 ? 'y' : 'ies'} approaching`;

  const textRows = opportunities
    .map((opp) => `- ${opp.title}\n  Deadline: ${toPrettyDate(opp.deadline)}\n  ${opp.href}`)
    .join('\n');

  const textSuggested = suggestedOpportunities
    .map((opp) => `- ${opp.title} (Deadline: ${toPrettyDate(opp.deadline)})\n  ${opp.href}`)
    .join('\n');

  const text = [
    `You have ${count} tracked opportunit${count === 1 ? 'y' : 'ies'} with deadlines in the next ${daysAhead} day${
      daysAhead === 1 ? '' : 's'
    }.`,
    '',
    textRows,
    '',
    textSuggested ? `More key opportunities to check:\n${textSuggested}` : '',
    '',
    `Subscribe to newsletter for constant updates: ${newsletterUrl}`,
    `Follow us on LinkedIn: ${LINKEDIN_URL}`,
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
    preheader: `${count} tracked opportunit${count === 1 ? 'y has' : 'ies have'} approaching deadlines.`,
    eyebrow: 'Deadline Reminder',
    heroTitle: `${count} deadline${count === 1 ? '' : 's'} approaching`,
    heroSubtitle: `Action recommended within the next ${daysAhead} day${daysAhead === 1 ? '' : 's'}.`,
    body: `${renderInfoCard(
      'Action recommended',
      'Review these opportunities now and complete your submission steps before deadline.'
    )}
    <h3 style="margin:4px 0 10px;font-size:16px;color:#0f172a;">Tracked opportunities nearing deadline</h3>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${renderOpportunityRows(opportunities)}</table>
    ${renderSuggestedSection(suggestedOpportunities)}
    ${renderNewsletterSection(newsletterUrl)}
    ${renderLinkedInSection()}
    ${unsubscribeHtml}`
  });

  return { subject, text, html };
}
