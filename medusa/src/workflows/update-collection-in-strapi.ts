import {
  createWorkflow,
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { UpdateCollectionInStrapiInput, updateCollectionInStrapiStep } from "./steps/update-collection-in-strapi"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createCollectionInStrapiWorkflow } from "./create-collection-in-strapi"
import { syncProductsForCollectionStep } from "./steps/sync-products-for-collection-step"

export type UpdateCollectionInStrapiWorkflowInput = {
  id: string
}

export const updateCollectionInStrapiWorkflow = createWorkflow(
  "update-collection-in-strapi",
  (input: UpdateCollectionInStrapiWorkflowInput) => {
    // Fetch the collection with all necessary fields including metadata and products
    const { data: collections } = useQueryGraphStep({
      entity: "product_collection",
      fields: [
        "id",
        "title",
        "handle",
        "metadata",
        "products.id",
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    // If collection doesn't exist in Strapi, create it
    const createResult = when({ collections }, (data) => !data.collections[0].metadata?.strapi_id).then(() => {
      return createCollectionInStrapiWorkflow.runAsStep({
        input: {
          id: input.id,
        }
      })
    })

    const updateResult = when({ collections }, (data) => !!data.collections[0].metadata?.strapi_id).then(() => {

      // Try to update the collection in Strapi
      return updateCollectionInStrapiStep({
        collection: collections[0],
      } as UpdateCollectionInStrapiInput)
    })

    const result = transform({
      createResult,
      updateResult,
    }, (data) => {
      return data.createResult || data.updateResult
    })

    // Sync product-collection relations in Strapi
    const syncInput = transform({ collections }, (data) => ({
      productIds: (data.collections[0].products ?? []).map((p) => p?.id).filter((id): id is string => !!id),
      collectionMedusaId: data.collections[0].id,
    }))

    syncProductsForCollectionStep(syncInput)

    return new WorkflowResponse(result)
  }
)
