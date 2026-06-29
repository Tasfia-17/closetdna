import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.POSTGRES_URL!)
export default sql

export async function query<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
  return sql(strings, ...values) as Promise<T[]>
}
