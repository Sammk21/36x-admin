import {
  createWorkflow,
  WorkflowResponse,
  transform,
} from "@medusajs/framework/workflows-sdk"
import {
  CreateCollectionInStrapiInput,
  createCollectionInStrapiStep
} from "./steps/create-collection-in-strapi"
import {
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { updateCollectionMetadataStep } from "./steps/update-collection-metadata"
import { syncProductsForCollectionStep } from "./steps/sync-products-for-collection-step"

export type CreateCollectionInStrapiWorkflowInput = {
  id: string
}

export const createCollectionInStrapiWorkflow = createWorkflow(
  "create-collection-in-strapi",
  (input: CreateCollectionInStrapiWorkflowInput) => {
    const { data: collections } = useQueryGraphStep({
      entity: "product_collection",
      fields: [
        "id",
        "title",
        "handle",
        "products.id",
        "products.metadata",
      ],
      filters: {
        id: input.id,
      },
      options: {
        throwIfKeyNotFound: true,
      }
    })

    const collectionData = transform({ collections }, (data) => {
      return {
        id: data.collections[0].id,
        title: data.collections[0].title,
        handle: data.collections[0].handle,
      }
    })

    const strapiCollection = createCollectionInStrapiStep({
      collection: collectionData,
    } as CreateCollectionInStrapiInput)

    const collectionMetadataUpdate = transform({ strapiCollection }, (data) => {
      return {
        collectionId: data.strapiCollection.medusaId,
        strapiId: data.strapiCollection.id,
        strapiDocumentId: data.strapiCollection.documentId,
      }
    })

    updateCollectionMetadataStep(collectionMetadataUpdate)

    // After the collection is created in Strapi, update each product's collection relation.
    // Runs unconditionally — no-op when there are no products.
    const syncInput = transform({ collections }, (data) => ({
      productIds: (data.collections[0].products || []).map((p: any) => p.id),
      collectionMedusaId: data.collections[0].id,
    }))

    syncProductsForCollectionStep(syncInput)

    return new WorkflowResponse(strapiCollection)
  }
)
