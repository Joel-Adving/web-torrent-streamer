'use client'

import { useEffect, useRef, useState } from 'react'

type Torrent = {
  name: string
  magnetURI: string
}

export default function Home() {
  const [url, setUrl] = useState('')
  const [torrentId, setTorrentId] = useState('')
  const [torrents, setTorrents] = useState<Torrent[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)

  const setStreamUrl = (uri: string) => {
    setUrl('/api/stream' + uri.replace('magnet:', ''))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStreamUrl(torrentId)
  }

  const getTorrentsList = () => {
    fetch('/api/getTorrents')
      .then((res) => res.json())
      .then((data) => setTorrents(data))
  }

  const handleRemoveAllTorrents = () => {
    setUrl('')
    setTorrentId('')
    fetch('/api/removeAllTorrents').then(() => getTorrentsList())
  }

  const handleRemoveTorrent = (magnetURI: string) => {
    setUrl('')
    fetch('/api/removeTorrent/' + magnetURI.replace('magnet:', '')).then(() => getTorrentsList())
  }

  useEffect(() => {
    getTorrentsList()
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const eventHandler = () => {
      videoRef.current?.play()
      getTorrentsList()
    }
    video.addEventListener('canplay', eventHandler)
    return () => video.addEventListener('canplay', eventHandler)
  }, [])

  return (
    <main>
      <div className="flex gap-3 p-3">
        <form onSubmit={handleSubmit} className="flex w-full gap-3">
          <input
            className="w-full px-3 py-1 border rounded"
            value={torrentId}
            onChange={(e) => setTorrentId(e.target.value)}
          />
          <button className="px-3 py-1 border rounded whitespace-nowrap" type="submit">
            Stream
          </button>
        </form>
        <button type="button" onClick={handleRemoveAllTorrents} className="px-3 py-1 border rounded whitespace-nowrap">
          Wipe Torrents
        </button>
      </div>
      <video src={url} ref={videoRef} controls width="100%" height="100%" className="h-[80vh]"></video>

      <div className="flex flex-col mx-auto mt-4 w-fit itemc">
        {torrents?.map((torrent, i) => (
          <div key={i} className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setStreamUrl(torrent.magnetURI)}>{torrent.name}</div>
            <button onClick={() => handleRemoveTorrent(torrent.magnetURI)} className="px-2 py-0.5 border rounded">
              remove
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
