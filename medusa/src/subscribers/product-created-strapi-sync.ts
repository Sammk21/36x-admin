import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { createProductInStrapiWorkflow } from "../workflows/create-product-in-strapi"

export default async function productCreatedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")
  logger.info(`[subscriber:product.created] id=${data.id}`)
  await createProductInStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
  logger.info(`[subscriber:product.created] done id=${data.id}`)
}

export const config: SubscriberConfig = {
  event: "product.created",
}

