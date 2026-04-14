import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type ClearCollectionFromStrapiProductsInput = {
  collectionMedusaId: string
}

/**
 * Finds all Strapi products that reference the given collection and clears that
 * relation. This runs BEFORE deleting the collection so that products are not
 * left with a dangling reference.
 *
 * Note: We query Strapi directly because the Medusa collection record is already
 * deleted by the time the `product-collection.deleted` event fires.
 */
export const clearCollectionFromStrapiProductsStep = createStep(
  "clear-collection-from-strapi-products",
  async ({ collectionMedusaId }: ClearCollectionFromStrapiProductsInput, { container }) => {
    const logger = container.resolve("logger")
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    logger.info(`[clear-collection-from-strapi-products] Clearing collection relation for medusaId=${collectionMedusaId}`)

    // Find the Strapi collection record
    const strapiCollection = await strapiService.findByMedusaId(
      Collection.PRODUCT_COLLECTIONS,
      collectionMedusaId,
      ["products"]
    )

    if (!strapiCollection) {
      logger.warn(`[clear-collection-from-strapi-products] Strapi collection not found for medusaId=${collectionMedusaId}, nothing to clear`)
      return new StepResponse([], null)
    }

    const products: any[] = Array.isArray(strapiCollection.products) ? strapiCollection.products : []

    logger.info(`[clear-collection-from-strapi-products] Found ${products.length} products referencing collection documentId=${strapiCollection.documentId}`)

    const affectedProducts: Array<{ documentId: string; collectionDocumentId: string }> = []

    for (const product of products) {
      if (!product?.documentId) continue

      await strapiService.update(Collection.PRODUCTS, product.documentId, {
        product_collection: null,
      })

      logger.info(`[clear-collection-from-strapi-products] Cleared collection from product documentId=${product.documentId}`)

      affectedProducts.push({
        documentId: product.documentId,
        collectionDocumentId: strapiCollection.documentId,
      })
    }

    logger.info(`[clear-collection-from-strapi-products] Done. Cleared ${affectedProducts.length} products`)

    return new StepResponse(
      affectedProducts,
      // Compensation: restore the collection relation on each product
      {
        collectionDocumentId: strapiCollection.documentId,
        productDocumentIds: affectedProducts.map((p) => p.documentId),
      }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) return

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    const { collectionDocumentId, productDocumentIds } = compensationData

    for (const productDocumentId of productDocumentIds) {
      await strapiService.update(Collection.PRODUCTS, productDocumentId, {
        product_collection: collectionDocumentId,
      })
    }
  }
)
