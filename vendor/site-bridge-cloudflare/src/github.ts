import type { PublishFile, RepositoryCommit, RepositoryPublisher } from './contracts.js'

export interface GitHubContentsPublisherConfig {
  owner: string
  repository: string
  branch: string
  token: string
  fetch: (url: string, init?: RequestInit) => Promise<Response>
}

/** Publishes one Git tree and advances the branch only after every blob is accepted. */
export class GitHubGitDataPublisher implements RepositoryPublisher {
  constructor(private readonly config: GitHubContentsPublisherConfig) {}

  async putFiles({ deploymentId, files }: { deploymentId: string; files: PublishFile[] }): Promise<RepositoryCommit> {
    if (!files.length) throw new Error('GitHub publication requires at least one file')
    const base = `https://api.github.com/repos/${this.config.owner}/${this.config.repository}/git`
    const headers = { Authorization: `Bearer ${this.config.token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' }
    const ref = await this.config.fetch(`${base}/ref/heads/${this.config.branch}`, { headers })
    if (!ref.ok) throw new Error(`GitHub branch lookup failed: ${ref.status}`)
    const head = await ref.json() as { object: { sha: string } }
    const previous = await this.config.fetch(`${base}/commits/${head.object.sha}`, { headers })
    if (!previous.ok) throw new Error(`GitHub commit lookup failed: ${previous.status}`)
    const previousCommit = await previous.json() as { tree: { sha: string } }
    const tree: Array<{ path: string; mode: '100644'; type: 'blob'; sha: string }> = []
    for (const file of files) {
      const content = typeof file.content === 'string' ? new TextEncoder().encode(file.content) : file.content
      const response = await this.config.fetch(`${base}/blobs`, {
        method: 'POST', headers, body: JSON.stringify({ content: toBase64(content), encoding: 'base64' }),
      })
      if (!response.ok) throw new Error(`GitHub blob write failed: ${response.status}`)
      tree.push({ path: file.path, mode: '100644', type: 'blob', sha: (await response.json() as { sha: string }).sha })
    }
    const treeResponse = await this.config.fetch(`${base}/trees`, { method: 'POST', headers, body: JSON.stringify({ base_tree: previousCommit.tree.sha, tree }) })
    if (!treeResponse.ok) throw new Error(`GitHub tree write failed: ${treeResponse.status}`)
    const commitResponse = await this.config.fetch(`${base}/commits`, { method: 'POST', headers, body: JSON.stringify({ message: `Publish growth deployment ${deploymentId}`, tree: (await treeResponse.json() as { sha: string }).sha, parents: [head.object.sha] }) })
    if (!commitResponse.ok) throw new Error(`GitHub commit write failed: ${commitResponse.status}`)
    const commit = await commitResponse.json() as { sha: string; html_url: string }
    const update = await this.config.fetch(`${base}/refs/heads/${this.config.branch}`, { method: 'PATCH', headers, body: JSON.stringify({ sha: commit.sha, force: false }) })
    if (!update.ok) throw new Error(`GitHub branch update failed: ${update.status}`)
    return { id: commit.sha, url: commit.html_url }
  }
}

/** @deprecated Compatibility export. This now uses the atomic Git Data API. */
export const GitHubContentsPublisher = GitHubGitDataPublisher

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}
