/**
 * Tell IndexNow engines (Bing, Yandex, Seznam, Naver) about every sitemap URL.
 * Run after a production deploy: pnpm indexnow
 * Optional: pnpm indexnow https://mojesuproperties.com/rent/ … to ping specific URLs.
 *
 * The key must match public/<key>.txt (served at the site root).
 */
const KEY = '80743294eee489d4b0e61525f88d0e9e'
const ORIGIN = 'https://mojesuproperties.com'

async function sitemapUrls(): Promise<string[]> {
  const res = await fetch(`${ORIGIN}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a.startsWith(ORIGIN))
  const urlList = args.length ? args : await sitemapUrls()

  const keyRes = await fetch(`${ORIGIN}/${KEY}.txt`)
  if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
    throw new Error('IndexNow key file is not live yet — deploy first.')
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(ORIGIN).host,
      key: KEY,
      keyLocation: `${ORIGIN}/${KEY}.txt`,
      urlList,
    }),
  })
  console.log(`IndexNow: ${res.status} ${res.statusText} — ${urlList.length} URLs submitted`)
  if (res.status >= 400) process.exit(1)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
