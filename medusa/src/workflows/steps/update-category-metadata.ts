import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { ProductCategoryDTO } from "@medusajs/framework/types"

export type UpdateCategoryMetadataInput = {
  categoryId: string
  strapiId: number
  strapiDocumentId: string
}

export const updateCategoryMetadataStep = createStep(
  "update-category-metadata",
  async ({ categoryId, strapiId, strapiDocumentId }: UpdateCategoryMetadataInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    // Fetch original metadata for compensation
    const originalCategory = await productModuleService.retrieveProductCategory(categoryId)

    // Update category metadata
    const updated = await productModuleService.updateProductCategories(
      categoryId,
      {
        metadata: {
          ...originalCategory.metadata,
          strapi_id: strapiId,
          strapi_document_id: strapiDocumentId,
        },
      }
    )

    return new StepResponse(updated, originalCategory)
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    // Restore original metadata
    await productModuleService.updateProductCategories(compensationData.id, {
      metadata: compensationData.metadata,
    })
  }
)
