import { client } from '@/libs/webtorret'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dn, tr, xt } = req.query as { dn: string; tr: string[]; xt: string }
  const trs = tr.map((t) => `tr=${t}`).join('&')
  const torrentId = `magnet:?xt=${xt}&dn=${dn}${trs}`
  if (!torrentId) {
    return res.status(400).json({ error: 'No torrent id provided' })
  }

  const torrent = client.get(torrentId)
  if (!torrent) {
    return res.status(400).json({ error: 'No torrent found' })
  }

  client.remove(torrent)
  torrent.destroy()

  res.json({ success: true })
}
