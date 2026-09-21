/**
 * Optional Bitly short links for WhatsApp message length.
 * Falls back to the full URL when BITLY_ACCESS_TOKEN is unset.
 */

export async function shortenUrl(
  longUrl: string,
  bitlyToken?: string,
): Promise<string> {
  if (!bitlyToken) return longUrl

  try {
    const res = await fetch('https://api-ssl.bitly.com/v4/shorten', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bitlyToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ long_url: longUrl }),
    })
    if (!res.ok) return longUrl
    const data = (await res.json()) as { link?: string }
    return data.link || longUrl
  } catch {
    return longUrl
  }
}
