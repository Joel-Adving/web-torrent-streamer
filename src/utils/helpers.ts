import type { NextApiRequest } from 'next'

export function torrentIdFromQuery(query: NextApiRequest['query']) {
  const { dn, tr, xt } = query as { dn: string; tr: string[]; xt: string }
  return `magnet:?xt=${xt}&dn=${dn}${tr.map((t) => `tr=${t}`).join('&')}`
}
