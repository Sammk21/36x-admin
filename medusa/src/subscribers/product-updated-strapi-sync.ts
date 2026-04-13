import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { updateProductInStrapiWorkflow } from "../workflows/update-product-in-strapi"

export default async function productUpdatedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const cachingService = container.resolve(Modules.CACHING)
  const logger = container.resolve("logger")

  logger.info(`[subscriber:product.updated] id=${data.id}`)

  // Check if this update is being processed from a Strapi webhook
  // If so, skip syncing back to prevent infinite loops
  const cacheKey = `strapi-update:product:${data.id}`
  const isProcessingFromStrapi = await cachingService.get({ key: cacheKey })

  if (isProcessingFromStrapi) {
    logger.info(`[subscriber:product.updated] Skipping — originated from Strapi id=${data.id}`)
    return
  }

  logger.info(`[subscriber:product.updated] Running updateProductInStrapiWorkflow id=${data.id}`)

  await updateProductInStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })

  logger.info(`[subscriber:product.updated] done id=${data.id}`)
}

export const config: SubscriberConfig = {
  event: "product.updated",
}

