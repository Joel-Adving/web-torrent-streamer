import { client } from '@/libs/webtorret'
import path from 'path'
import { NextApiRequest, NextApiResponse } from 'next'
import type { Torrent } from 'webtorrent'

export const config = {
  api: {
    responseLimit: false
  }
}

const CHUNK_SIZE = 10 ** 6 // 1MB

const streamTorrent = (torrent: Torrent, req: NextApiRequest, res: NextApiResponse) => {
  const file = torrent?.files?.find((file) => file?.name?.endsWith('.mp4'))
  if (!file) {
    return res.status(400).json({ error: 'No mp4 file found' })
  }
  const fileSize = file.length
  const range = req.headers.range ?? 'bytes=0-'

  if (range) {
    const start = Number(range.replace(/\D/g, ''))
    const end = Math.min(start + CHUNK_SIZE, fileSize - 1)

    if (start >= fileSize || end >= fileSize) {
      res.writeHead(416, {
        'Content-Range': `bytes */${fileSize}`
      })
      return res.end()
    }

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': end - start + 1,
      'Content-Type': 'video/mp4'
    })

    const readStream = file.createReadStream({ start, end })
    readStream.pipe(res)
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    })
    const readStream = file.createReadStream()
    readStream.pipe(res)
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dn, tr, xt } = req.query as { dn: string; tr: string[]; xt: string }
  const trs = tr.map((t) => `tr=${t}`).join('&')
  const torrentId = `magnet:?xt=${xt}&dn=${dn}${trs}`
  if (!torrentId) {
    return res.status(400).json({ error: 'No torrent id provided' })
  }

  const alreadyAddedTorrent = client.get(torrentId)
  if (alreadyAddedTorrent) {
    streamTorrent(alreadyAddedTorrent, req, res)
    return
  }

  const torrent = await new Promise<Torrent>((resolve) => {
    client.add(
      torrentId,
      {
        path: path.resolve(process.cwd(), 'torrents'),
        destroyStoreOnDestroy: true,
        strategy: 'sequential'
      },
      (torrent) => {
        resolve(torrent)
      }
    )
  })

  if (!torrent) {
    return res.status(400).json({ error: 'Error adding torrent' })
  }

  let torrentReady = false
  while (!torrentReady) {
    await new Promise((r) => setTimeout(r, 1000))
    if (torrent.files.length > 0 && torrent.ready && torrent.files.find((file) => file.name.endsWith('.mp4'))) {
      torrentReady = true
    }
  }

  if (torrentReady) {
    streamTorrent(torrent, req, res)
  } else {
    res.status(400).json({ error: 'Torrent not ready' })
  }
}
