import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type CreateCategoryInStrapiInput = {
  category: {
    id: string
    name: string
    handle: string
    description?: string
    is_active?: boolean
    is_internal?: boolean
  }
}

export const createCategoryInStrapiStep = createStep(
  "create-category-in-strapi",
  async ({ category }: CreateCategoryInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Create category in Strapi
    const strapiCategory = await strapiService.create(Collection.PRODUCT_CATEGORIES, {
      medusaId: category.id,
      name: category.name,
      handle: category.handle,
      description: category.description,
      is_active: category.is_active ?? true,
      is_internal: category.is_internal ?? false,
    })

    return new StepResponse(
      strapiCategory.data,
      strapiCategory.data
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Delete the category
    await strapiService.delete(Collection.PRODUCT_CATEGORIES, compensationData.documentId)
  }
)
