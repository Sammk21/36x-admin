I have an existing Strapi integration with Medusa that handles two-way product synchronization 
(create, update, delete). I need you to extend this integration to also handle 
**Product Categories** and **Product Collections**.

Follow the exact same patterns used for products in this project:

## What already exists (for reference):
- A `src/modules/strapi/` module with a service and loader
- Workflows in `src/workflows/` for creating, updating, deleting products in Strapi
- Subscribers in `src/subscribers/` listening to `product.created`, `product.updated`, `product.deleted`
- A virtual read-only link in `src/links/product-strapi.ts`
- A webhook handler at `src/api/webhooks/strapi/route.ts` for syncing Strapi changes back to Medusa

## What I need you to build:

### 1. Strapi Content Types (in the Strapi project)
- A `product-category` content type schema with fields: `medusaId`, `name`, `handle`, `description`, `is_active`, `is_internal`
- A `product-collection` content type schema with fields: `medusaId`, `title`, `handle`
- Controllers, services, and routes for each (using Strapi factory methods)

### 2. Medusa Workflows
For **categories** (`src/workflows/`):
- `create-category-in-strapi.ts` — triggered on `product-category.created`
- `update-category-in-strapi.ts` — triggered on `product-category.updated`  
- `delete-category-in-strapi.ts` — triggered on `product-category.deleted`

For **collections** (`src/workflows/`):
- `create-collection-in-strapi.ts` — triggered on `product-collection.created`
- `update-collection-in-strapi.ts` — triggered on `product-collection.updated`
- `delete-collection-in-strapi.ts` — triggered on `product-collection.deleted`

Each workflow should use steps that call the Strapi Module's service methods 
(`create`, `update`, `delete`, `findByMedusaId`), and include compensation functions.

### 3. Medusa Subscribers (`src/subscribers/`)
- One subscriber per event for categories: `product-category.created`, `product-category.updated`, `product-category.deleted`
- One subscriber per event for collections: `product-collection.created`, `product-collection.updated`, `product-collection.deleted`

### 4. Virtual Read-Only Links
- `src/links/product-category-strapi.ts` — linking `ProductModule.linkable.productCategory` to a `strapi_category` alias in the Strapi Module
- `src/links/product-collection-strapi.ts` — linking `ProductModule.linkable.productCollection` to a `strapi_collection` alias

### 5. Strapi Module Service — extend `src/modules/strapi/service.ts`
- Add `PRODUCT_CATEGORIES` and `PRODUCT_COLLECTIONS` to the `Collection` enum
- Add a `list` overload or extend the existing `list` method to handle `category_id` and `collection_id` filters for the read-only links

### 6. Webhook Handler — extend `src/workflows/handle-strapi-webhook.ts`
- Add `when` branches for `model === "product-category"` and `model === "product-collection"`
- Add a `prepareStrapiUpdateDataStep` case for each model

### 7. Store API Routes (optional)
- Extend store product category and collection endpoints to include `*strapi_category` and `*strapi_collection` fields

Use TypeScript throughout. Follow the same error handling, compensation function, and 
`StepResponse` patterns already used in the product workflows.
