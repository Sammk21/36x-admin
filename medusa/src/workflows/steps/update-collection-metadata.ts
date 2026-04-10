import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { ProductCollectionDTO } from "@medusajs/framework/types"

export type UpdateCollectionMetadataInput = {
  collectionId: string
  strapiId: number
  strapiDocumentId: string
}

export const updateCollectionMetadataStep = createStep(
  "update-collection-metadata",
  async ({ collectionId, strapiId, strapiDocumentId }: UpdateCollectionMetadataInput, { container }) => {
    const productModuleService = container.resolve(Modules.PRODUCT)

    // Fetch original metadata for compensation
    const originalCollection = await productModuleService.retrieveProductCollection(collectionId)

    // Update collection metadata
    const updated = await productModuleService.updateProductCollections(
      collectionId,
      {
        metadata: {
          ...originalCollection.metadata,
          strapi_id: strapiId,
          strapi_document_id: strapiDocumentId,
        },
      }
    )

    return new StepResponse(updated, originalCollection)
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const productModuleService = container.resolve(Modules.PRODUCT)

    // Restore original metadata
    await productModuleService.updateProductCollections(compensationData.id, {
      metadata: compensationData.metadata,
    })
  }
)
