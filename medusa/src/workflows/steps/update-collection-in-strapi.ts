import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type UpdateCollectionInStrapiInput = {
  collection: {
    id: string
    title?: string
    handle?: string
  }
}

export const updateCollectionInStrapiStep = createStep(
  "update-collection-in-strapi",
  async ({ collection }: UpdateCollectionInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Fetch current Strapi collection data for compensation
    const originalCollection = await strapiService.findByMedusaId(Collection.PRODUCT_COLLECTIONS, collection.id)

    // Update collection in Strapi
    const updated = await strapiService.update(Collection.PRODUCT_COLLECTIONS, originalCollection.documentId, {
      title: collection.title,
      handle: collection.handle,
    })

    return new StepResponse(
      updated.data,
      originalCollection
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.update(Collection.PRODUCT_COLLECTIONS, compensationData.documentId, {
      title: compensationData.title,
      handle: compensationData.handle,
    })
  }
)
