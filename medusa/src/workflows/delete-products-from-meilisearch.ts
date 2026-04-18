import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import { deleteProductsFromMeilisearchStep } from "./steps/delete-products-from-meilisearch"

type DeleteProductsFromMeilisearchWorkflowInput = {
  ids: string[]
}

export const deleteProductsFromMeilisearchWorkflow = createWorkflow(
  "delete-products-from-meilisearch",
  function (input: DeleteProductsFromMeilisearchWorkflowInput) {
    deleteProductsFromMeilisearchStep(input)
  }
)
