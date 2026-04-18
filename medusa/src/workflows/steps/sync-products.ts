import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MEILISEARCH_MODULE } from "../../modules/meilisearch"
import MeilisearchModuleService from "../../modules/meilisearch/service"

export type SyncProductsStepInput = {
  products: {
    id: string
    title: string
    description?: string
    handle: string
    thumbnail?: string
    categories: { id: string; name: string; handle: string }[]
    tags: { id: string; value: string }[]
  }[]
}

export const syncProductsStep = createStep(
  "sync-products",
  async ({ products }: SyncProductsStepInput, { container }) => {
    const meilisearchModuleService =
      container.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)

    const existingProducts = await meilisearchModuleService.retrieveFromIndex(
      products.map((p) => p.id),
      "product"
    )
    const newProducts = products.filter(
      (p) => !existingProducts.some((e: any) => e.id === p.id)
    )
    await meilisearchModuleService.indexData(
      products as unknown as Record<string, unknown>[],
      "product"
    )

    return new StepResponse(undefined, {
      newProducts: newProducts.map((p) => p.id),
      existingProducts,
    })
  },
  async (data, { container }) => {
    if (!data) return
    const { newProducts, existingProducts } = data as {
      newProducts: string[]
      existingProducts: Record<string, unknown>[]
    }
    const meilisearchModuleService =
      container.resolve<MeilisearchModuleService>(MEILISEARCH_MODULE)
    if (newProducts.length) {
      await meilisearchModuleService.deleteFromIndex(newProducts, "product")
    }
    if (existingProducts.length) {
      await meilisearchModuleService.indexData(existingProducts, "product")
    }
  }
)
