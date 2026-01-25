import { Opportunity } from './supabase';

export function getOpportunityStatus(deadline: string): 'Active' | 'Expired' {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  return deadlineDate >= today ? 'Active' : 'Expired';
}

export function isDeadlineSoon(deadline: string): boolean {
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
}

export function formatDeadline(deadline: string): string {
  const date = new Date(deadline);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function filterActiveOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter(opp => getOpportunityStatus(opp.deadline) === 'Active');
}

export function filterExpiredOpportunities(opportunities: Opportunity[]): Opportunity[] {
  return opportunities.filter(opp => getOpportunityStatus(opp.deadline) === 'Expired');
}