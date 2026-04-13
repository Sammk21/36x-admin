import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { updateCollectionInStrapiWorkflow } from "../workflows/update-collection-in-strapi"

export default async function productCollectionUpdatedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const cachingService = container.resolve(Modules.CACHING)
  const logger = container.resolve("logger")

  logger.info(`[subscriber:product-collection.updated] Received event for collection id=${data.id}`)

  // Check if this update is being processed from a Strapi webhook
  // If so, skip syncing back to prevent infinite loops
  const cacheKey = `strapi-update:product-collection:${data.id}`
  const isProcessingFromStrapi = await cachingService.get({ key: cacheKey })

  if (isProcessingFromStrapi) {
    logger.info(`[subscriber:product-collection.updated] Skipping — update originated from Strapi (id=${data.id})`)
    return
  }

  logger.info(`[subscriber:product-collection.updated] Running updateCollectionInStrapiWorkflow for id=${data.id}`)

  await updateCollectionInStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "product-collection.updated",
}
