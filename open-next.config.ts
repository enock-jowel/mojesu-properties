import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/**
 * Staging / Workers deploy config.
 * Incremental cache via R2 can be added after the account enables R2
 * (see docs/cloudflare-staging.md).
 */
export default defineCloudflareConfig({})
