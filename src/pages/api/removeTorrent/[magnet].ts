import { client } from '@/libs/webtorret'
import { torrentIdFromQuery } from '@/utils/helpers'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const torrentId = torrentIdFromQuery(req.query)
  if (!torrentId) {
    return res.status(400).json({ error: 'No torrent id provided' })
  }

  const torrent = client.get(torrentId)
  if (!torrent) {
    return res.status(400).json({ error: 'No torrent found' })
  }

  client.remove(torrent)
  torrent.destroy()

  res.send(`${torrent.name} removed from client`)
}
