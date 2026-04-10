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
  async ({ productId, categoryIds, collectionId }: SyncProductRelationsInStrapiInput, { container }) => {
    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)

    // Find the Strapi product — if it doesn't exist yet, skip silently
    const strapiProduct = await strapiService.findByMedusaId(
      Collection.PRODUCTS,
      productId,
      ["categories", "product_collection"]
    )
    if (!strapiProduct) {
      return new StepResponse(null, null)
    }

    // Resolve Strapi documentIds for all Medusa categories
    const categoryDocumentIds: string[] = []
    for (const categoryId of categoryIds) {
      const strapiCategory = await strapiService.findByMedusaId(
        Collection.PRODUCT_CATEGORIES,
        categoryId
      )
      if (strapiCategory) {
        categoryDocumentIds.push(strapiCategory.documentId)
      }
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

    // Capture original relations for compensation
    const originalCategoryDocumentIds = Array.isArray(strapiProduct.categories)
      ? strapiProduct.categories.map((c: any) => c.documentId).filter(Boolean)
      : []
    const originalCollectionDocumentId =
      strapiProduct.product_collection?.documentId ?? null

    // Update the Strapi product's relations
    await strapiService.update(Collection.PRODUCTS, strapiProduct.documentId, {
      categories: { set: categoryDocumentIds },
      product_collection: collectionDocumentId,
    })

    return new StepResponse(
      { categoryDocumentIds, collectionDocumentId },
      {
        strapiProductDocumentId: strapiProduct.documentId,
        originalCategoryDocumentIds,
        originalCollectionDocumentId,
      }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const strapiService: StrapiModuleService = container.resolve(STRAPI_MODULE)
    const {
      strapiProductDocumentId,
      originalCategoryDocumentIds,
      originalCollectionDocumentId,
    } = compensationData

    await strapiService.update(Collection.PRODUCTS, strapiProductDocumentId, {
      categories: { set: originalCategoryDocumentIds },
      product_collection: originalCollectionDocumentId,
    })
  }
)
