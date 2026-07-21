import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import type { FileStorage } from './fileStorage.js'

interface DownloadTokenPayload {
  key: string
  expiresAt: number
}

export class LocalFileStorage implements FileStorage {
  private readonly root: string

  constructor(root: string, private readonly signingSecret: string) {
    this.root = resolve(root)
  }

  private objectPath(key: string) {
    const normalizedKey = key.replaceAll('\\', '/')
    const objectPath = resolve(this.root, normalizedKey)
    if (objectPath !== this.root && !objectPath.startsWith(`${this.root}${sep}`)) {
      throw new Error('Invalid storage key')
    }
    return objectPath
  }

  async put(input: { key: string; contentType: string; bytes: Buffer }) {
    const objectPath = this.objectPath(input.key)
    await mkdir(dirname(objectPath), { recursive: true })
    await writeFile(objectPath, input.bytes, { flag: 'wx' })
    return {
      key: input.key,
      contentType: input.contentType,
      size: input.bytes.length,
      checksum: createHash('sha256').update(input.bytes).digest('hex'),
    }
  }

  async get(key: string) {
    return readFile(this.objectPath(key))
  }

  async createDownloadToken(key: string, expiresInSeconds: number) {
    const payload = Buffer.from(JSON.stringify({
      key,
      expiresAt: Math.floor(Date.now() / 1000) + expiresInSeconds,
    } satisfies DownloadTokenPayload)).toString('base64url')
    const signature = createHmac('sha256', this.signingSecret).update(payload).digest('base64url')
    return `${payload}.${signature}`
  }

  async resolveDownloadToken(token: string) {
    const [payload, signature, extra] = token.split('.')
    if (!payload || !signature || extra) return null
    const expected = createHmac('sha256', this.signingSecret).update(payload).digest()
    let received: Buffer
    try {
      received = Buffer.from(signature, 'base64url')
    } catch {
      return null
    }
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null

    try {
      const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as DownloadTokenPayload
      if (typeof parsed.key !== 'string' || parsed.expiresAt < Math.floor(Date.now() / 1000)) return null
      this.objectPath(parsed.key)
      return parsed.key
    } catch {
      return null
    }
  }
}
