// src/app/api/sheet/route.ts
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// Shared BASE for your published sheet
const BASE =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTLICxWkOzCBLlCLTUM5hQAy04hyZ2G4qZBTPVff9QiMKwxzMISEsbdRFp_1qWfWH7WMUt-c5w8QJ6n/pub';

// Map logical keys -> gids
const MAP: Record<string, string> = {
  OOM: '1778336569',
  TQE1: '1208158980',
  TQE2: '1521728872',
  TQE3: '1845609019',
  TQE4: '1340015654',
  TQE5: '1087142582',
  TQE6: '1087206475',
  TQE7: '639052434',
  ECLECTIC: '1602664288',
};

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
      const gid = gidParam || (key ? MAP[key] : '');
      if (!gid) {
        return new Response(
          JSON.stringify({ error: `Unknown sheet. Provide ?src=<google_csv_url>, ?k=[${Object.keys(MAP).join(', ')}], or ?gid=<gid>` }),
          { status: 400, headers: { 'content-type': 'application/json' } }
        );
      }
      const u = new URL(BASE);
      u.searchParams.set('gid', gid);
      u.searchParams.set('output', 'csv');
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
