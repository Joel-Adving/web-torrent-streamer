import { client } from '@/libs/webtorret'
import path from 'path'
import fs from 'fs'
import fsExtra from 'fs-extra'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const torrents = client.torrents

    for (const torrent of torrents) {
      client.remove(torrent)
      torrent.destroy()
      torrent.files.forEach((file) => {
        console.log(file.path)
        fs.unlinkSync(file.path)
      })
      fs.rmdirSync(torrent.path)
    }

    const dir = path.resolve(process.cwd(), `torrents`)
    client.torrents.forEach((tor) => client.remove(tor))
    fsExtra.emptyDirSync(dir)

    res.json({ success: true })
  } catch (e) {
    res.json({ success: false })
  }
}
