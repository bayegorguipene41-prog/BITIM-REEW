/** @type {import('next').NextConfig} */
process.env.NEXT_TELEMETRY_DISABLED = '1'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // NOTE: no CSP Added here on purpose.
  // A correct CSP for this app needs nonce/hash handling (Next.js inline
  // bootstrap scripts + external Google fonts) and a Content-Security-Policy
  // that is verified not to break the app before rollout. Documented as a
  // follow-up step rather than shipping a risky/blanket policy.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig