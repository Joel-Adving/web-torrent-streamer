import WebTorrent from 'webtorrent'

export const client = new WebTorrent()
client.setMaxListeners(100)
