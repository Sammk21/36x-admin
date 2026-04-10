import {
  createWorkflow,
  WorkflowResponse,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { UpdateCategoryInStrapiInput, updateCategoryInStrapiStep } from "./steps/update-category-in-strapi"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { createCategoryInStrapiWorkflow } from "./create-category-in-strapi"

export type UpdateCategoryInStrapiWorkflowInput = {
  id: string
}

export const updateCategoryInStrapiWorkflow = createWorkflow(
  "update-category-in-strapi",
  (input: UpdateCategoryInStrapiWorkflowInput) => {
    // Fetch the category with all necessary fields including metadata
    const { data: categories } = useQueryGraphStep({
      entity: "product_category",
      fields: [
        "id",
        "name",
        "handle",
        "description",
        "is_active",
        "is_internal",
        "metadata",
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    // If category doesn't exist in Strapi, create it
    const createResult = when({ categories }, (data) => !data.categories[0].metadata?.strapi_id).then(() => {
      return createCategoryInStrapiWorkflow.runAsStep({
        input: {
          id: input.id,
        }
      })
    })

    const updateResult = when({ categories }, (data) => !!data.categories[0].metadata?.strapi_id).then(() => {

      // Try to update the category in Strapi
      return updateCategoryInStrapiStep({
        category: categories[0],
      } as UpdateCategoryInStrapiInput)
    })

    const result = transform({
      createResult,
      updateResult,
    }, (data) => {
      return data.createResult || data.updateResult
    })

    return new WorkflowResponse(result)
  }
)
