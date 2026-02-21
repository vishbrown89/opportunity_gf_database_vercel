import { NextResponse } from 'next/server';

export async function GET() {
  const openai = process.env.OPENAI_API_KEY || '';
  const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const normPublic = publicSupabaseUrl.trim();
  const normServer = supabaseUrl.trim();

  return NextResponse.json({
    has_openai_key: openai.length > 10,
    has_public_supabase_url: normPublic.length > 0,
    has_server_supabase_url: normServer.length > 0,
    has_anon_key: anon.length > 20,
    public_supabase_url_starts_https: normPublic.startsWith('https://'),
    server_supabase_url_starts_https: normServer.startsWith('https://'),
    public_supabase_url_host: normPublic.replace(/^https?:\/\//, '').split('/')[0],
    server_supabase_url_host: normServer.replace(/^https?:\/\//, '').split('/')[0],
    anon_key_prefix: anon.slice(0, 12),
    version: 'v3',
  });
}
