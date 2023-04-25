import type { NextApiRequest } from 'next'

export function torrentIdFromQuery(query: NextApiRequest['query']) {
  const { dn, tr, xt } = query as { dn: string; tr: string[]; xt: string }
  return `magnet:?xt=${xt}&dn=${dn}${tr.map((t) => `tr=${t}`).join('&')}`
}

export function mediaType(file: string) {
  if (file.endsWith('.mkv')) {
    return 'video/x-matroska'
  }
  if (file.endsWith('.mp4')) {
    return 'video/mp4'
  }
}

export function isMediaFile(file: string) {
  return file.endsWith('.mkv') || file.endsWith('.mp4')
}
