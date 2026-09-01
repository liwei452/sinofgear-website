# Cloudflare static-site bridge

`defineGrowthSite` exposes the authenticated `/growth/v1` contract for a static site.
It separates preview from publication, validates reviewed cover metadata and
site-relative links, stages exact cover bytes, and writes the article plus its immutable
cover in one repository commit through a replaceable publisher.

The included `GitHubContentsPublisher` keeps its compatibility name but uses GitHub's
Git Data API to create an atomic multi-file commit. Publication remains `PUBLISHING`
until the configured `deploymentStatus` callback confirms that the production provider
has deployed that commit. If the callback is not configured, `/status` returns an
actionable `DEPLOYMENT_STATUS_NOT_CONFIGURED` response instead of claiming success.

Supply fake `fetch`, repository, KV, reviewed-asset, and deployment-status dependencies
in tests. The package never publishes on its own.
