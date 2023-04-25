import { client } from '@/libs/webtorret'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const torrents = client.torrents.map((torrent) => {
    return {
      name: torrent.name,
      magnetURI: torrent.magnetURI
    }
  })

  res.json(torrents ?? [])
}
