interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
}

interface R2ObjectBody {
  httpMetadata?: { contentType?: string }
  arrayBuffer(): Promise<ArrayBuffer>
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>
  put(key: string, value: Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>
}
