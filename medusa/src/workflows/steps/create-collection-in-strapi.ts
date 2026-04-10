import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type CreateCollectionInStrapiInput = {
  collection: {
    id: string
    title: string
    handle: string
  }
}

export const createCollectionInStrapiStep = createStep(
  "create-collection-in-strapi",
  async ({ collection }: CreateCollectionInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Create collection in Strapi
    const strapiCollection = await strapiService.create(Collection.PRODUCT_COLLECTIONS, {
      medusaId: collection.id,
      title: collection.title,
      handle: collection.handle,
    })

    return new StepResponse(
      strapiCollection.data,
      strapiCollection.data
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Delete the collection
    await strapiService.delete(Collection.PRODUCT_COLLECTIONS, compensationData.documentId)
  }
)
