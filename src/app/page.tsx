'use client'

import { useEffect, useRef, useState } from 'react'

type Torrent = {
  name: string
  magnetURI: string
}

export default function Home() {
  const [streamUrl, setStreamUrl] = useState('')
  const [magnetURI, setMagnetURI] = useState('')
  const [torrents, setTorrents] = useState<Torrent[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStreamUrl('/api/stream/' + magnetURI)
  }

  const getTorrentsList = () => {
    fetch('/api/getTorrents')
      .then((res) => res.json())
      .then((data) => setTorrents(data))
  }

  const handleWipeAllTorrentData = () => {
    setStreamUrl('')
    setMagnetURI('')
    fetch('/api/removeAllTorrents').then(() => getTorrentsList())
  }

  const handleRemoveTorrent = (magnetURI: string) => {
    setStreamUrl('')
    fetch('/api/removeTorrent/' + magnetURI).then(() => getTorrentsList())
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
        <form className="flex w-full gap-3" onSubmit={handleSubmit}>
          <input
            placeholder="magnet:?xt=urn:btih:0506D..."
            className="w-full px-3 py-1 border rounded"
            value={magnetURI}
            onChange={(e) => setMagnetURI(e.target.value)}
          />
          <button className="px-3 py-1 border rounded whitespace-nowrap" type="submit">
            Stream
          </button>
        </form>
        <button className="px-3 py-1 border rounded whitespace-nowrap" onClick={handleWipeAllTorrentData} type="button">
          Wipe Torrent Dir
        </button>
      </div>
      <video src={streamUrl} ref={videoRef} controls width="100%" height="100%" className="h-[80vh]"></video>
      <div className="flex flex-col items-center gap-3 mx-auto my-4 w-fit">
        {torrents?.map((torrent, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="cursor-pointer" onClick={() => setStreamUrl('/api/stream/' + torrent.magnetURI)}>
              {torrent.name}
            </div>
            <button
              className="px-2 py-0.5 border rounded cursor-pointer"
              onClick={() => handleRemoveTorrent(torrent.magnetURI)}
            >
              remove
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
