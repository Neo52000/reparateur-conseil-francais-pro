const DEFAULT_ALLOWED_ORIGINS = [
  'https://topreparateurs.fr',
  'https://www.topreparateurs.fr',
  'http://localhost:5173',
  'http://localhost:8080',
];

function parseAllowedOrigins(): string[] {
  const fromEnv = Deno.env.get('ALLOWED_ORIGINS');
  if (!fromEnv) return DEFAULT_ALLOWED_ORIGINS;
  return fromEnv.split(',').map((o) => o.trim()).filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins();

const baseHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
};

export function buildCorsHeaders(req?: Request): HeadersInit {
  const origin = req?.headers.get('Origin') ?? '';
  const isAllowed = allowedOrigins.includes(origin);
  return {
    ...baseHeaders,
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
  };
}

export const corsHeaders = {
  ...baseHeaders,
  'Access-Control-Allow-Origin': allowedOrigins[0],
};

export function handlePreflight(req: Request): Response | null {
  if (req.method !== 'OPTIONS') return null;
  return new Response(null, { headers: buildCorsHeaders(req) });
}
