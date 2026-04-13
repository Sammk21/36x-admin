import {
  createWorkflow,
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { UpdateProductInStrapiInput, updateProductInStrapiStep } from "./steps/update-product-in-strapi"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createProductInStrapiWorkflow } from "./create-product-in-strapi"
import { syncProductRelationsInStrapiStep } from "./steps/sync-product-relations-in-strapi"

export type UpdateProductInStrapiWorkflowInput = {
  id: string
}

export const updateProductInStrapiWorkflow = createWorkflow(
  "update-product-in-strapi",
  (input: UpdateProductInStrapiWorkflowInput) => {
    // Fetch the product with all necessary fields including metadata
    const { data: products } = useQueryGraphStep({
      entity: "product",
      fields: [
        "id",
        "title",
        "subtitle",
        "description",
        "handle",
        "metadata",
        "categories.id",
        "collection.id",
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    // If product doesn't exist in Strapi, create it
    const createResult = when({ products }, (data) => !data.products[0].metadata?.strapi_id).then(() => {
      return createProductInStrapiWorkflow.runAsStep({
        input: {
          id: input.id,
        }
      })
    })

    const updateResult = when({ products }, (data) => !!data.products[0].metadata?.strapi_id).then(() => {
      // Try to update the product in Strapi
      return updateProductInStrapiStep({
        product: products[0],
      } as UpdateProductInStrapiInput)
    })

    const result = transform({
      createResult,
      updateResult,
    }, (data) => {
      return data.createResult || data.updateResult
    })

    // Sync category and collection relations to Strapi
    const relationInput = transform({ products }, (data) => ({
      productId: data.products[0].id,
      categoryIds: (data.products[0].categories || []).map((c: any) => c.id),
      collectionId: data.products[0].collection?.id ?? null,
    }))

    syncProductRelationsInStrapiStep(relationInput)

    return new WorkflowResponse(result)
  }
)

