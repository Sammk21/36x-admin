import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

export type UpdateCollectionInput = {
  id: string
  title?: string
  handle?: string
}

export const updateCollectionStep = createStep(
  "update-collection",
  async ({ id, ...update }: UpdateCollectionInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    const originalCollection = await productModuleService.retrieveProductCollection(id)

    const updated = await productModuleService.updateProductCollections(id, update)

    return new StepResponse(updated, originalCollection)
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    await productModuleService.updateProductCollections(compensationData.id, {
      title: compensationData.title,
      handle: compensationData.handle,
    })
  }
)
