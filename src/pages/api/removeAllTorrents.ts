import { client } from '@/libs/webtorret'
import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    for (const torrent of client.torrents) {
      client.remove(torrent)
      torrent.destroy()
      torrent.files.forEach((file) => {
        fs.unlinkSync(file.path)
      })
      fs.rmdirSync(torrent.path)
    }

    res.send('All torrents removed')
  } catch (e) {
    res.send('Error removing torrents')
  }
}
