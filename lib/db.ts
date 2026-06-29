import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let _sql: NeonQueryFunction<false, false> | null = null

export function getDb(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const url = process.env.POSTGRES_URL
    if (!url) {
      throw new Error(
        'POSTGRES_URL is not configured. ' +
        'Add it in Vercel Dashboard > Settings > Environment Variables. ' +
        'Get a free Aurora-compatible database at https://neon.tech'
      )
    }
    _sql = neon(url)
  }
  return _sql
}

// Convenience re-export so existing callers can do:
//   import sql from '@/lib/db'
//   await sql`SELECT 1`
// This is a function, not a tagged template, but neon() returns a tagged template function.
// We wrap it so the lazy check runs on first use.
const sqlProxy = new Proxy(
  // placeholder function that forwards to the lazy client
  function (strings: TemplateStringsArray, ...values: unknown[]) {
    return getDb()(strings, ...values)
  } as NeonQueryFunction<false, false>,
  {}
)

export default sqlProxy
