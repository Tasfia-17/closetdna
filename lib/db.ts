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

// Tagged-template proxy — same interface as neon() directly.
// Nothing executes until the first actual SQL call at request time.
const sql: NeonQueryFunction<false, false> = new Proxy(
  function placeholder() {} as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      const db = getDb()
      return (db as unknown as (...a: unknown[]) => unknown)(...args)
    },
  }
)

export default sql
