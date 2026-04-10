import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { deleteCollectionFromStrapiWorkflow } from "../workflows/delete-collection-from-strapi"

export default async function productCollectionDeletedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  await deleteCollectionFromStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "product-collection.deleted",
}
