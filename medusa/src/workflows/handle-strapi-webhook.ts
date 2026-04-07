import {
  createWorkflow,
  when,
  transform,
} from "@medusajs/framework/workflows-sdk"
import { useQueryGraphStep } from "@medusajs/medusa/core-flows"
import { prepareStrapiUpdateDataStep } from "./steps/prepare-strapi-update-data"
import { clearProductCacheStep } from "./steps/clear-product-cache"
import { updateProductOptionValueStep } from "./steps/update-product-option-value"
import { updateCategoryStep } from "./steps/update-category"
import { updateCollectionStep } from "./steps/update-collection"
import {
  updateProductsWorkflow,
  updateProductVariantsWorkflow,
  updateProductOptionsWorkflow,
} from "@medusajs/medusa/core-flows"
import {
  UpsertProductDTO,
  UpsertProductVariantDTO,
} from "@medusajs/framework/types"

export type WorkflowInput = {
  entry: any
}

export const handleStrapiWebhookWorkflow = createWorkflow(
  "handle-strapi-webhook-workflow",
  (input: WorkflowInput) => {
    const preparedData = prepareStrapiUpdateDataStep({
      entry: input.entry,
    })

    when(input, (input) => input.entry.model === "product")
      .then(() => {
        updateProductsWorkflow.runAsStep({
          input: {
            products: [preparedData.data as unknown as UpsertProductDTO],
          },
        })

        // Clear the product cache after update
        const productId = transform({ preparedData }, (data) => {
          return (data.preparedData.data as any).id
        })

        clearProductCacheStep({ productId })
      })

    when(input, (input) => input.entry.model === "product-variant")
      .then(() => {
        const variants = updateProductVariantsWorkflow.runAsStep({
          input: {
            product_variants: [preparedData.data as unknown as UpsertProductVariantDTO],
          },
        })

        clearProductCacheStep({ 
          productId: variants[0].product_id!
        }).config({ name: "clear-product-cache-variant" })
      })

    when(input, (input) => input.entry.model === "product-option")
      .then(() => {
        const options = updateProductOptionsWorkflow.runAsStep({
          input: preparedData.data as any,
        })

        clearProductCacheStep({ 
          productId: options[0].product_id!
        }).config({ name: "clear-product-cache-option" })
      })

    when(input, (input) => input.entry.model === "product-option-value")
      .then(() => {
        // Update the option value using the Product Module
        const optionValueData = transform({ preparedData }, (data) => ({
          id: data.preparedData.data.optionValueId as string,
          value: data.preparedData.data.value as string,
        }))

        updateProductOptionValueStep(optionValueData)

        // Find all variants that use this option value to clear their product cache
        const { data: variants } = useQueryGraphStep({
          entity: "product_variant",
          fields: [
            "id",
            "product_id",
          ],
          filters: {
            options: {
              id: preparedData.data.optionValueId as string,
            },
          },
        }).config({ name: "get-variants-from-option-value" })

        // Clear the product cache for all affected products
        const productIds = transform({ variants }, (data) => {
          const uniqueProductIds = [...new Set(data.variants.map((v) => v.product_id))]
          return uniqueProductIds as string[]
        })

        clearProductCacheStep({
          productId: productIds
        }).config({ name: "clear-product-cache-option-value" })
      })

    when(input, (input) => input.entry.model === "product-category")
      .then(() => {
        const categoryData = transform({ preparedData }, (data) => ({
          id: data.preparedData.data.id as string,
          name: data.preparedData.data.name as string,
          handle: data.preparedData.data.handle as string,
          description: data.preparedData.data.description as string,
          is_active: data.preparedData.data.is_active as boolean,
          is_internal: data.preparedData.data.is_internal as boolean,
        }))

        updateCategoryStep(categoryData)
      })

    when(input, (input) => input.entry.model === "product-collection")
      .then(() => {
        const collectionData = transform({ preparedData }, (data) => ({
          id: data.preparedData.data.id as string,
          title: data.preparedData.data.title as string,
          handle: data.preparedData.data.handle as string,
        }))

        updateCollectionStep(collectionData)
      })
  }
)

