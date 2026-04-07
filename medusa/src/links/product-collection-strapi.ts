import { defineLink } from "@medusajs/framework/utils"
import ProductModule from "@medusajs/medusa/product"
import { STRAPI_MODULE } from "../modules/strapi"

export default defineLink(
  {
    linkable: ProductModule.linkable.productCollection,
    field: "id",
  },
  {
    linkable: {
      serviceName: STRAPI_MODULE,
      alias: "strapi_collection",
      primaryKey: "collection_id",
    },
  },
  {
    readOnly: true,
  }
)
