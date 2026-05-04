/**
 * Vérifie qu'un déploiement est sain. Utilisable :
 *   - en local après DNS flip   : `tsx scripts/post-deploy-check.ts`
 *   - sur la preview Netlify    : `BASE_URL=https://deploy-preview-N--top-reparateurs.netlify.app tsx scripts/post-deploy-check.ts`
 *
 * Vérifications :
 *   1. Routes critiques répondent 200
 *   2. Headers sécurité présents (CSP, HSTS, X-Frame-Options)
 *   3. sitemap-index.xml + robots.txt accessibles et bien formés
 *   4. Redirections 301 légales (/blog/article → /blog)
 *   5. Meta description présente sur la home (SEO)
 *
 * Sort avec exit code 1 si une vérification échoue.
 */

const BASE_URL = (process.env.BASE_URL ?? 'https://topreparateurs.fr').replace(/\/$/, '');

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail = ''): void {
  results.push({ name, ok, detail });
}

async function checkRoute(path: string, expectedStatus = 200): Promise<void> {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    record(
      `route ${path}`,
      res.status === expectedStatus,
      `HTTP ${res.status}${res.status !== expectedStatus ? ` (attendu ${expectedStatus})` : ''}`,
    );
  } catch (err) {
    record(`route ${path}`, false, `erreur réseau : ${(err as Error).message}`);
  }
}

async function checkRedirect(from: string, expectedTo: string): Promise<void> {
  const url = `${BASE_URL}${from}`;
  try {
    const res = await fetch(url, { redirect: 'manual' });
    const loc = res.headers.get('location') ?? '';
    record(
      `redirect ${from} → ${expectedTo}`,
      res.status === 301 && loc.endsWith(expectedTo),
      `HTTP ${res.status}, Location: ${loc || '(aucun)'}`,
    );
  } catch (err) {
    record(`redirect ${from}`, false, `erreur : ${(err as Error).message}`);
  }
}

async function checkSecurityHeaders(): Promise<void> {
  const required = [
    'content-security-policy',
    'strict-transport-security',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy',
    'permissions-policy',
  ];

  try {
    const res = await fetch(`${BASE_URL}/`, { method: 'HEAD' });
    for (const header of required) {
      const value = res.headers.get(header);
      record(`header ${header}`, value !== null, value ?? '(absent)');
    }
  } catch (err) {
    record('security headers', false, `erreur : ${(err as Error).message}`);
  }
}

async function checkSitemap(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/sitemap-index.xml`);
    const body = await res.text();
    const ok =
      res.status === 200 &&
      body.includes('<sitemapindex') &&
      body.includes('<loc>');
    record('sitemap-index.xml', ok, `HTTP ${res.status}, ${body.length} octets`);
  } catch (err) {
    record('sitemap-index.xml', false, `erreur : ${(err as Error).message}`);
  }
}

async function checkRobots(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/robots.txt`);
    const body = await res.text();
    const ok =
      res.status === 200 &&
      body.toLowerCase().includes('user-agent') &&
      body.toLowerCase().includes('sitemap');
    record('robots.txt', ok, `HTTP ${res.status}, contient User-agent + Sitemap : ${ok}`);
  } catch (err) {
    record('robots.txt', false, `erreur : ${(err as Error).message}`);
  }
}

async function checkSeoMeta(): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/`);
    const body = await res.text();
    const hasTitle = /<title>[^<]{10,}<\/title>/i.test(body);
    const hasDescription = /<meta\s+name=["']description["']\s+content=["'][^"']{50,}/i.test(body);
    const hasCanonical = /<link\s+rel=["']canonical["']/i.test(body);
    record('SEO meta home', hasTitle && hasDescription && hasCanonical,
      `title=${hasTitle} description=${hasDescription} canonical=${hasCanonical}`);
  } catch (err) {
    record('SEO meta home', false, `erreur : ${(err as Error).message}`);
  }
}

async function main(): Promise<void> {
  console.log(`\nPost-deploy check sur ${BASE_URL}\n`);

  const routes200 = [
    '/', '/search', '/blog', '/repairer-plans', '/repairer-auth',
    '/client-auth', '/legal-notice', '/privacy', '/terms', '/cookies',
    '/subscription-success', '/subscription-canceled',
    '/reparation-smartphone', '/reparation-tablette', '/reparation-ordinateur',
  ];

  await Promise.all([
    ...routes200.map((p) => checkRoute(p, 200)),
    checkRedirect('/blog/article/test-slug', '/blog/test-slug'),
    checkRedirect('/blog/repairers/article/test-slug', '/blog/repairers/test-slug'),
    checkSecurityHeaders(),
    checkSitemap(),
    checkRobots(),
    checkSeoMeta(),
  ]);

  let failed = 0;
  for (const r of results) {
    const icon = r.ok ? '✓' : '✗';
    console.log(`${icon} ${r.name.padEnd(50)} ${r.detail}`);
    if (!r.ok) failed += 1;
  }

  console.log(`\n${results.length - failed}/${results.length} OK\n`);

  if (failed > 0) {
    console.error(`${failed} vérification(s) échouée(s). Stop.`);
    process.exit(1);
  }
}

main();
