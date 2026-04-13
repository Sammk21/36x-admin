import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { STRAPI_MODULE } from "../../modules/strapi"
import StrapiModuleService, { Collection } from "../../modules/strapi/service"

export type SyncProductsForCollectionInput = {
  productIds: string[]
  collectionMedusaId: string
}

/**
 * For each product ID, finds its Strapi record and updates the product_collection
 * relation to point at the given collection (resolved by medusaId).
 *
 * This is called after a collection is created/updated so that all products
 * belonging to it immediately reflect the correct collection reference in Strapi.
 */
export const syncProductsForCollectionStep = createStep(
  "sync-products-for-collection",
  async ({ productIds, collectionMedusaId }: SyncProductsForCollectionInput, { container }) => {
    const logger = container.resolve("logger")

    logger.info(`[sync-products-for-collection] collectionMedusaId=${collectionMedusaId} productIds=[${productIds.join(", ")}]`)

    if (!productIds.length) {
      logger.info(`[sync-products-for-collection] No products to sync for collection ${collectionMedusaId}`)
      return new StepResponse([], null)
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    const strapiCollection = await strapiService.findByMedusaId(
      Collection.PRODUCT_COLLECTIONS,
      collectionMedusaId
    )

    if (!strapiCollection) {
      logger.warn(`[sync-products-for-collection] Strapi collection not found for medusaId=${collectionMedusaId}, skipping product sync`)
      return new StepResponse([], null)
    }

    logger.info(`[sync-products-for-collection] Found Strapi collection documentId=${strapiCollection.documentId}`)

    const updated: Array<{ productDocumentId: string; previousCollectionDocumentId: string | null }> = []

    for (const productMedusaId of productIds) {
      const strapiProduct = await strapiService.findByMedusaId(
        Collection.PRODUCTS,
        productMedusaId,
        ["product_collection"]
      )

      if (!strapiProduct) {
        logger.warn(`[sync-products-for-collection] Strapi product not found for medusaId=${productMedusaId}, skipping`)
        continue
      }

      const previousCollectionDocumentId = strapiProduct.product_collection?.documentId ?? null

      await strapiService.update(Collection.PRODUCTS, strapiProduct.documentId, {
        product_collection: strapiCollection.documentId,
      })

      logger.info(`[sync-products-for-collection] Updated product documentId=${strapiProduct.documentId} -> collection documentId=${strapiCollection.documentId}`)

      updated.push({
        productDocumentId: strapiProduct.documentId,
        previousCollectionDocumentId,
      })
    }

    logger.info(`[sync-products-for-collection] Done. Updated ${updated.length}/${productIds.length} products`)

    return new StepResponse(updated, updated)
  },
  async (compensationData, { container }) => {
    if (!compensationData?.length) return

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    for (const { productDocumentId, previousCollectionDocumentId } of compensationData) {
      await strapiService.update(Collection.PRODUCTS, productDocumentId, {
        product_collection: previousCollectionDocumentId,
      })
    }
  }
)
