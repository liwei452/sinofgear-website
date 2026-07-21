export interface StoredObject {
  key: string
  contentType: string
  size: number
  checksum: string
}

export interface FileStorage {
  put(input: { key: string; contentType: string; bytes: Buffer }): Promise<StoredObject>
  get(key: string): Promise<Buffer>
  createDownloadToken(key: string, expiresInSeconds: number): Promise<string>
  resolveDownloadToken(token: string): Promise<string | null>
}
