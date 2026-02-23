// src/app/api/sheet/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { SHEET_KEY_TO_URL } from '@/config/data-sources'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const srcParam = searchParams.get('src');
    const key = (searchParams.get('k') || '').toUpperCase();
    const gidParam = searchParams.get('gid');

    let upstreamUrl: URL | null = null
    if (srcParam) {
      const src = new URL(srcParam)
      const allowedHosts = new Set(['docs.google.com', 'spreadsheets.google.com'])
      if (src.protocol !== 'https:' || !allowedHosts.has(src.hostname)) {
        return new Response(JSON.stringify({ error: 'Unsupported src host' }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        })
      }
      src.searchParams.set('cacheBust', Date.now().toString())
      upstreamUrl = src
    } else {
      const fromKey = key ? SHEET_KEY_TO_URL[key] : ''
      const fromGid = gidParam ? `https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub?gid=${gidParam}&output=csv` : ''
      const resolved = fromKey || fromGid
      if (!resolved) {
        return new Response(
          JSON.stringify({ error: `Unknown sheet. Provide ?src=<google_csv_url>, ?k=[${Object.keys(SHEET_KEY_TO_URL).join(', ')}], or ?gid=<gid>` }),
          { status: 400, headers: { 'content-type': 'application/json' } }
        );
      }
      const u = new URL(resolved)
      u.searchParams.set('cacheBust', Date.now().toString());
      upstreamUrl = u
    }

    const upstream = await fetch(upstreamUrl.toString(), {
      cache: 'no-store',
      headers: { 'cache-control': 'no-cache', 'pragma': 'no-cache' },
    });

    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Upstream ${upstream.status}` }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }

    const csv = await upstream.text();

    return new Response(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
        pragma: 'no-cache',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
