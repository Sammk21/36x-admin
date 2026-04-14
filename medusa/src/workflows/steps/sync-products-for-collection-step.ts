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

    // Single query: fetch all products currently linked to this collection in Strapi.
    // This gives us documentId + medusaId for all of them — no per-product re-fetch needed.
    const currentlyLinkedResult = await (strapiService as any).client_.collection(Collection.PRODUCTS).find({
      filters: {
        product_collection: {
          documentId: {
            $eq: strapiCollection.documentId,
          },
        },
      },
      fields: ["documentId", "medusaId"],
      pagination: { pageSize: 500 },
    })

    // medusaId -> documentId for everything currently in Strapi for this collection
    const linkedMap = new Map<string, string>(
      (currentlyLinkedResult.data ?? []).map((p: any) => [p.medusaId, p.documentId] as [string, string])
    )

    logger.info(`[sync-products-for-collection] Currently linked in Strapi: ${linkedMap.size} products`)

    const medusaIdSet = new Set(productIds)
    const updated: Array<{ productDocumentId: string; previousCollectionDocumentId: string | null }> = []

    // Remove relation from products no longer in Medusa's list
    for (const [medusaId, documentId] of linkedMap) {
      if (!medusaIdSet.has(medusaId)) {
        await strapiService.update(Collection.PRODUCTS, documentId, {
          product_collection: null,
        })
        logger.info(`[sync-products-for-collection] Removed collection from product documentId=${documentId} (medusaId=${medusaId})`)
      }
    }

    // Add relation only for products NOT already linked — skip products already correct
    for (const productMedusaId of productIds) {
      if (linkedMap.has(productMedusaId)) {
        // Already linked to this collection — no update needed
        logger.info(`[sync-products-for-collection] Product medusaId=${productMedusaId} already linked, skipping`)
        continue
      }

      // New addition: need to look up its documentId
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

      logger.info(`[sync-products-for-collection] Linked product documentId=${strapiProduct.documentId} -> collection documentId=${strapiCollection.documentId}`)

      updated.push({
        productDocumentId: strapiProduct.documentId,
        previousCollectionDocumentId,
      })
    }

    logger.info(`[sync-products-for-collection] Done. Linked ${updated.length} new, removed ${linkedMap.size - (productIds.length - updated.length)} stale`)

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
