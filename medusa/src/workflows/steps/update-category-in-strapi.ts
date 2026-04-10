import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type UpdateCategoryInStrapiInput = {
  category: {
    id: string
    name?: string
    handle?: string
    description?: string
    is_active?: boolean
    is_internal?: boolean
  }
}

export const updateCategoryInStrapiStep = createStep(
  "update-category-in-strapi",
  async ({ category }: UpdateCategoryInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Fetch current Strapi category data for compensation
    const originalCategory = await strapiService.findByMedusaId(Collection.PRODUCT_CATEGORIES, category.id)

    // Update category in Strapi
    const updated = await strapiService.update(Collection.PRODUCT_CATEGORIES, originalCategory.documentId, {
      name: category.name,
      handle: category.handle,
      description: category.description,
      is_active: category.is_active,
      is_internal: category.is_internal,
    })

    return new StepResponse(
      updated.data,
      originalCategory
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.update(Collection.PRODUCT_CATEGORIES, compensationData.documentId, {
      name: compensationData.name,
      handle: compensationData.handle,
      description: compensationData.description,
      is_active: compensationData.is_active,
      is_internal: compensationData.is_internal,
    })
  }
)
