import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MEILISEARCH_MODULE } from "../../../modules/meilisearch"
import MeilisearchModuleService from "../../../modules/meilisearch/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { q } = req.query as { q?: string }

  if (!q) {
    return res.status(400).json({ message: "Query parameter 'q' is required" })
  }

  const meilisearchModuleService =
    req.scope.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)

  const results = await meilisearchModuleService.search(q, "product")

  res.json(results)
}
