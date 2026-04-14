import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type SyncProductRelationsInStrapiInput = {
  productId: string
  categoryIds: string[]
  collectionId: string | null
}

export const syncProductRelationsInStrapiStep = createStep(
  "sync-product-relations-in-strapi",
  async ({ productId, collectionId }: SyncProductRelationsInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Find the Strapi product — if it doesn't exist yet, skip silently
    const strapiProduct = await strapiService.findByMedusaId(
      Collection.PRODUCTS,
      productId,
      ["product_collection"]
    )
    if (!strapiProduct) {
      return new StepResponse(null, null)
    }

    // Resolve Strapi documentId for the Medusa collection
    let collectionDocumentId: string | null = null
    if (collectionId) {
      const strapiCollection = await strapiService.findByMedusaId(
        Collection.PRODUCT_COLLECTIONS,
        collectionId
      )
      if (strapiCollection) {
        collectionDocumentId = strapiCollection.documentId
      }
    }

    const originalCollectionDocumentId =
      strapiProduct.product_collection?.documentId ?? null

    // Update the Strapi product's collection relation
    await strapiService.update(Collection.PRODUCTS, strapiProduct.documentId, {
      product_collection: collectionDocumentId,
    })

    return new StepResponse(
      { collectionDocumentId },
      {
        strapiProductDocumentId: strapiProduct.documentId,
        originalCollectionDocumentId,
      }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    await strapiService.update(Collection.PRODUCTS, compensationData.strapiProductDocumentId, {
      product_collection: compensationData.originalCollectionDocumentId,
    })
  }
)
