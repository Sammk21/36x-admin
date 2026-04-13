import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import {
  deleteCollectionFromStrapiStep,
} from "./steps/delete-collection-from-strapi"
import { clearCollectionFromStrapiProductsStep } from "./steps/clear-collection-from-strapi-products"

export type DeleteCollectionFromStrapiWorkflowInput = {
  id: string
}

export const deleteCollectionFromStrapiWorkflow = createWorkflow(
  "delete-collection-from-strapi",
  (input: DeleteCollectionFromStrapiWorkflowInput) => {
    // First clear the collection relation from all products that reference it in Strapi.
    // We query Strapi directly here because by the time this event fires the Medusa
    // collection record is already deleted, so useQueryGraphStep would find nothing.
    clearCollectionFromStrapiProductsStep({ collectionMedusaId: input.id })

    deleteCollectionFromStrapiStep(input)

    return new WorkflowResponse(void 0)
  }
)
