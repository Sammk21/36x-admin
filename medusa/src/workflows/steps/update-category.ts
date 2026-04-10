import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type UpdateCategoryInput = {
  id: string
  name?: string
  handle?: string
  description?: string
  is_active?: boolean
  is_internal?: boolean
}

export const updateCategoryStep = createStep(
  "update-category",
  async ({ id, ...update }: UpdateCategoryInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    const originalCategory = await productModuleService.retrieveProductCategory(id)

    const updated = await productModuleService.updateProductCategories(id, update)

    return new StepResponse(updated, originalCategory)
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    await productModuleService.updateProductCategories(compensationData.id, {
      name: compensationData.name,
      handle: compensationData.handle,
      description: compensationData.description,
      is_active: compensationData.is_active,
      is_internal: compensationData.is_internal,
    })
  }
)
