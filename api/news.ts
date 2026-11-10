import { getNews } from "./_lib/newsCore.js"

type VercelRequest = { method?: string; query?: { query?: string; category?: string } }
type VercelResponse = { status: (code: number) => { json: (body: unknown) => void } }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" })

  const { status, body } = await getNews({
    apiKey: process.env.NEWSDATA_API_KEY,
    category: req.query?.category,
    query: req.query?.query,
  })
  return res.status(status).json(body)
}
