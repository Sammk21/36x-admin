import {
  type SubscriberConfig,
  type SubscriberArgs,
} from "@medusajs/framework"
import { deleteCategoryFromStrapiWorkflow } from "../workflows/delete-category-from-strapi"

export default async function productCategoryDeletedStrapiSyncHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  await deleteCategoryFromStrapiWorkflow(container).run({
    input: {
      id: data.id,
    },
  })
}

export const config: SubscriberConfig = {
  event: "product-category.deleted",
}
