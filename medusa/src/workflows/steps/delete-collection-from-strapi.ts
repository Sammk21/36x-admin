import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type DeleteCollectionFromStrapiInput = {
  id: string
}

export const deleteCollectionFromStrapiStep = createStep(
  "delete-collection-from-strapi",
  async ({ id }: DeleteCollectionFromStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Find the Strapi collection
    const strapiCollection = await strapiService.findByMedusaId(Collection.PRODUCT_COLLECTIONS, id)

    // Delete collection from Strapi
    await strapiService.delete(Collection.PRODUCT_COLLECTIONS, strapiCollection.documentId)

    return new StepResponse(
      void 0,
      strapiCollection
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.create(Collection.PRODUCT_COLLECTIONS, {
      medusaId: compensationData.medusaId,
      title: compensationData.title,
      handle: compensationData.handle,
    })
  }
)
