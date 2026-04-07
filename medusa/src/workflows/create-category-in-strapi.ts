import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  CreateCategoryInStrapiInput,
  createCategoryInStrapiStep
} from "./steps/create-category-in-strapi"
import {
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { updateCategoryMetadataStep } from "./steps/update-category-metadata"

export type CreateCategoryInStrapiWorkflowInput = {
  id: string
}

export const createCategoryInStrapiWorkflow = createWorkflow(
  "create-category-in-strapi",
  (input: CreateCategoryInStrapiWorkflowInput) => {
    const { data: categories } = useQueryGraphStep({
      entity: "product_category",
      fields: [
        "id",
        "name",
        "handle",
        "description",
        "is_active",
        "is_internal",
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const categoryData = transform({ categories }, (data) => {
      return {
        id: data.categories[0].id,
        name: data.categories[0].name,
        handle: data.categories[0].handle,
        description: data.categories[0].description,
        is_active: data.categories[0].is_active,
        is_internal: data.categories[0].is_internal,
      }
    })

    const strapiCategory = createCategoryInStrapiStep({
      category: categoryData,
    } as CreateCategoryInStrapiInput)

    const categoryMetadataUpdate = transform({ strapiCategory }, (data) => {
      return {
        categoryId: data.strapiCategory.medusaId,
        strapiId: data.strapiCategory.id,
        strapiDocumentId: data.strapiCategory.documentId,
      }
    })

    updateCategoryMetadataStep(categoryMetadataUpdate)

    return new WorkflowResponse(strapiCategory)
  }
)
