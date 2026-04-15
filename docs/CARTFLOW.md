
# Create Cart in Storefront

In this guide, you'll learn how to create and store a cart in your storefront.

## Create Cart on First Access

It's recommended to create a cart the first time a customer accesses a page in your storefront. Then, you can store the cart's ID in the `localStorage` and access it whenever necessary.

To create a cart, send a request to the [Create Cart API route](https://docs.medusajs.com/api/store#carts_postcarts).

For example:

Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

### React

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useEffect } from "react"
import { sdk } from "@/lib/sdk"
// other imports...

export default function Home() {
  // TODO assuming you have the region retrieved
  const region = {
    id: "reg_123",
    // ...
  }

  // ...

  useEffect(() => {
    const cartId = localStorage.getItem("cart_id")
    if (cartId) {
      // customer already has a cart created
      return
    }

    // create a cart and store it in the localStorage
    sdk.store.cart.create({
      region_id: region.id,
    })
    .then(({ cart }) => {
      localStorage.setItem("cart_id", cart.id)
    })
  }, [])

  // ...
}
```

### JS SDK

```ts highlights={fetchHighlights}
sdk.store.cart.create({
  region_id: region.id,
})
.then(({ cart }) => {
  localStorage.setItem("cart_id", cart.id)
})
```

In this example, you create a cart by sending a request to the [Create Cart API route](https://docs.medusajs.com/api/store#carts_postcarts).

The response of the Create Cart API route has a `cart` field, which is a [cart object](https://docs.medusajs.com/api/store#carts_cart_schema).

Refer to the [Create Cart API reference](https://docs.medusajs.com/api/store#carts_postcarts) for details on other available request parameters.

### Cart's Sales Channel Scope

As mentioned before, you must always pass the publishable API key in the header of the request (which is done automatically by the JS SDK, as explained in the [Publishable API Keys](https://docs.medusajs.com/storefront-development/publishable-api-keys) guide). So, Medusa will associate the cart with the sales channel(s) of the publishable API key.

This is necessary, as only products matching the cart's sales channel(s) can be added to the cart. If you want to associate the cart with a different sales channel, or if the publishable API key is associated with multiple sales channels and you want to specify which one to use, you can pass the `sales_channel_id` parameter to the [Create Cart API route](https://docs.medusajs.com/api/store#carts_postcarts) with the desired sales channel's ID.

For example:

```ts
sdk.store.cart.create({
  region_id: region.id,
  sales_channel_id: "sc_123",
})
.then(({ cart }) => {
  // TODO use the cart...
  console.log(cart)
})
```

***

## Associate Customer with Cart

When the cart is created for a logged-in customer, it's automatically associated with that customer.

However, if the cart is created for a guest customer, then the customer logs in, then you have to set the cart's customer as explained in the [Update Cart](https://docs.medusajs.com/storefront-development/cart/update#set-carts-customer) guide.

***

## Set Cart's Locale

### Prerequisites

- [Translation Module Configured](https://docs.medusajs.com/commerce-modules/translation#configure-translation-module)

By default, items in the cart will have their associated product's original content. If your storefront supports [localization](https://docs.medusajs.com/storefront-development/localization), you can set the cart's locale to ensure that the item contents are in the customer's preferred language.

You can set the cart's locale by passing the `locale` request body parameter to the [Create Cart API route](https://docs.medusajs.com/api/store#carts_postcarts). For example:

```ts
sdk.store.cart.create({
  region_id: region.id,
  // you can also retrieve the locale from sdk.getLocale()
  locale: "fr-FR",
})
.then(({ cart }) => {
  // TODO use the cart...
  console.log(cart)
})
```

When the cart's locale is set, the cart's items will have their content in the specified locale if translations are available.

You can also [update the cart's locale](https://docs.medusajs.com/storefront-development/cart/update#set-cart-locale) later if the customer changes their language preference.

***

## Store Cart Details in React Context

If you're using React, it's then recommended to create a context that stores the cart details and make it available to all components in your application, as explained in the [Cart React Context in Storefront](https://docs.medusajs.com/storefront-development/cart/context) guide.


# Retrieve Cart in Storefront

In this guide, you'll learn how to retrieve a cart's details in your storefront.

Assuming you stored the cart's ID in the `localStorage` as explained in the [Create Cart guide](https://docs.medusajs.com/storefront-development/cart/create), you can retrieve a cart by sending a request to the [Get a Cart API route](https://docs.medusajs.com/api/store#carts_getcartsid).

For example:

### React

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/sdk"

export default function Cart() {
  const [cart, setCart] = useState<
    HttpTypes.StoreCart
  >()

  useEffect(() => {
    if (cart) {
      return
    }

    const cartId = localStorage.getItem("cart_id")
    if (!cartId) {
      // TODO create cart
      return
    }

    sdk.store.cart.retrieve(cartId)
    .then(({ cart: dataCart }) => {
      setCart(dataCart)
    })
  }, [cart])

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cart?.currency_code,
    })
    .format(amount)
  }

  return (
    <div>
      {!cart && <span>Loading...</span>}
      {cart && (
        <>
          <span>Cart ID: {cart.id}</span>
          <ul>
            {cart.items?.map((item) => (
              <li key={item.id}>
                {item.title} -
                Quantity: {item.quantity} -
                Price: {formatPrice(item.unit_price)}
              </li>
            ))}
          </ul>
          <span>Cart Total: {formatPrice(cart.total)}</span>
        </>
      )}
    </div>
  )
}
```

### JS SDK

```ts highlights={fetchHighlights}
sdk.store.cart.retrieve(cartId)
.then(({ cart }) => {
  // use cart...
  console.log(cart)
})
```

In this example, you retrieve a cart by sending a request to the [Get a Cart API route](https://docs.medusajs.com/api/store#carts_getcartsid).

The response of the [Get a Cart API route](https://docs.medusajs.com/api/store#carts_getcartsid) has a `cart` field, which is a [cart object](https://docs.medusajs.com/api/store#carts_cart_schema).

### Format Prices

When displaying the cart's totals or line item's price, make sure to format the price as implemented in the `formatPrice` function shown in the above snippet:

```ts
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cart?.currency_code,
  })
  .format(amount)
}
```

Since this is the same function used to [format the prices of product variants](https://docs.medusajs.com/storefront-development/products/price), you can define the function in one place and re-use it where necessary. In that case, make sure to pass the currency code as a parameter to the `formatPrice` function.

# Create Cart Context in Storefront

In this guide, you'll learn how to create a cart context in your storefront.

## Why Create a Cart Context?

Throughout your storefront, you'll need to access the customer's cart to perform different actions. For example, you may need to add a product variant to the cart from the product page.

So, if your storefront is React-based, create a cart context and add it at the top of your components tree. Then, you can access the customer's cart anywhere in your storefront.

***

## Create Cart Context Provider

For example, create the following file that exports a `CartProvider` component and a `useCart` hook:

- This example uses the `useRegion` hook defined in the [Region React Context guide](https://docs.medusajs.com/storefront-development/regions/context) to associate the cart with the customer's selected region.
- Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { 
  createContext, 
  useContext, 
  useEffect, 
  useState,
} from "react"
import { HttpTypes } from "@medusajs/types"
import { useRegion } from "./region"
import { sdk } from "@/lib/sdk"

type CartContextType = {
  cart?: HttpTypes.StoreCart
  setCart: React.Dispatch<
    React.SetStateAction<HttpTypes.StoreCart | undefined>
  >
  refreshCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

type CartProviderProps = {
  children: React.ReactNode
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<
    HttpTypes.StoreCart
  >()
  const { region } = useRegion()

  useEffect(() => {
    if (cart || !region) {
      return
    }

    const cartId = localStorage.getItem("cart_id")
    if (!cartId) {
      // create a cart
      sdk.store.cart.create({
        region_id: region.id,
      })
      .then(({ cart: dataCart }) => {
        localStorage.setItem("cart_id", dataCart.id)
        setCart(dataCart)
      })
    } else {
      // retrieve cart
      sdk.store.cart.retrieve(cartId)
      .then(({ cart: dataCart }) => {
        setCart(dataCart)
      })
    }
  }, [cart, region])

  const refreshCart = () => {
    localStorage.removeItem("cart_id")
    setCart(undefined)
  }

  return (
    <CartContext.Provider value={{
      cart,
      setCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }

  return context
}
```

The `CartProvider` handles retrieving or creating the customer's cart. It uses the `useRegion` hook defined in the [Region Context guide](https://docs.medusajs.com/storefront-development/regions/context) to associate the cart with the customer's selected region.

The `useCart` hook returns the value of the `CartContext`. Child components of `CartProvider` use this hook to access `cart`, `setCart`, or `refreshCart`.

`refreshCart` unsets the cart, which triggers the `useEffect` callback to create a cart. This is useful when the customer logs in or out, or after the customer places an order.

You can add to the context and provider other functions useful for updating the cart and its items. Refer to the following guides for details on how to implement these functions:

- [Manage Cart Items](https://docs.medusajs.com/storefront-development/cart/manage-items).
- [Update Cart's Region and Customer](https://docs.medusajs.com/storefront-development/cart/update).

***

## Use CartProvider in Component Tree

To use the cart context's value, add the `CartProvider` high in your component tree.

For example, if you're using Next.js, add it to the `app/layout.tsx` or `src/app/layout.tsx` file:

```tsx title="app/layout.tsx" collapsibleLines="1-14" highlights={[["23"]]}
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "@/providers/cart"
import { RegionProvider } from "@/providers/region"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RegionProvider>
          <CartProvider>
          {/* Other providers... */}
            {children}
          </CartProvider>
        </RegionProvider>
      </body>
    </html>
  )
}
```

Make sure to put the `CartProvider` as a child of the `RegionProvider` since it uses the `useRegion` hook defined in the [Region Context guide](https://docs.medusajs.com/storefront-development/regions/context).

### Use useCart Hook

Now, you can use the `useCart` hook in child components of `CartProvider`.

For example:

```tsx
"use client" // include with Next.js 13+
// ...
import { useCart } from "@/providers/cart"

export default function Products() {
  const { cart } = useCart()
  // ...
}
```

The `useCart` hook returns the cart details, which you can use in your components.

# Update Cart in Storefront

In this guide, you'll learn how to update different details of a cart.

This guide doesn't cover updating the cart's line items. For that, refer to the [Manage Cart's Items in Storefront](https://docs.medusajs.com/storefront-development/cart/manage-items) guide.

## Update Cart's Region

If a customer changes their region, you must update their cart to be associated with that region.

For example:

Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

```ts highlights={updateRegionHighlights}
sdk.store.cart.update(cartId, {
  region_id: "new_id",
})
.then(({ cart }) => {
  // use cart...
  console.log(cart)
})
```

The [Update Cart API route](https://docs.medusajs.com/api/store#carts_postcartsid) accepts a `region_id` request body parameter, whose value is the new region to associate with the cart.

***

## Set Cart's Customer

You might need to change the cart's customer in two cases:

- You created the cart for the customer as a guest, then they logged-in, so you want to associate the cart with them as a registered customer.
- You're transferring the cart from one customer to another, which is useful in company setups, such as when implementing B2B commerce applications.

To set or change the cart's customer, send an authenticated `POST` request to the Set Cart's Customer API route:

This API route is only available after [Medusa v2.0.5](https://github.com/medusajs/medusa/releases/tag/v2.0.5).

```ts
// TODO must be authenticated as the customer to set the cart's customer
sdk.store.cart.transferCart(cartId)
.then(({ cart }) => {
  // use cart...
  console.log(cart)
})
```

Assuming the JS SDK is configured to send an authenticated request, the cart is now associated with the logged-in customer.

Learn more about authenticating customers with the JS SDK in the [Login Customer guide](https://docs.medusajs.com/storefront-development/customers/login).

When using the Fetch API to send the request, either use `credentials: include` if the customer is already authenticated with a cookie session, or pass the Authorization Bearer token in the request's header.

***

## Set Cart's Locale

### Prerequisites

- [Translation Module Configured](https://docs.medusajs.com/commerce-modules/translation#configure-translation-module)

By default, items in the cart will have their associated product's original content. If your storefront supports [localization](https://docs.medusajs.com/storefront-development/localization), you can set the cart's locale to ensure that the item contents are in the customer's preferred language.

You can set the cart's locale by passing the `locale` request body parameter to the [Update Cart API route](https://docs.medusajs.com/api/store#carts_postcarts). For example:

```ts
sdk.store.cart.update(cartId, {
  // you can also retrieve the locale from sdk.getLocale()
  locale: "fr-FR",
})
.then(({ cart }) => {
  // TODO use the cart...
  console.log(cart)
})
```

When the cart's locale is set, existing and new items in the cart will have their content in the specified locale if translations are available.

# Manage Cart's Items in Storefront

In this guide, you'll learn how to manage a cart's line items, including adding, updating, and removing them.

## Add Product Variant to Cart

To add a product variant to a cart, use the [Add Line Item API route](https://docs.medusajs.com/api/store#carts_postcartsidlineitems).

To retrieve a variant's available quantity and check if it's in stock, refer to the [Retrieve Product Variant's Inventory](https://docs.medusajs.com/storefront-development/products/inventory) guide.

For example:

Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

```ts highlights={addHighlights}
const addToCart = (variant_id: string) => {
  const cartId = localStorage.getItem("cart_id")

  if (!cartId) {
    return
  }

  sdk.store.cart.createLineItem(cartId, {
    variant_id,
    quantity: 1,
  })
  .then(({ cart }) => {
    // use cart
    console.log(cart)
    alert("Product added to cart")
  })
}
```

The [Add Line Item API route](https://docs.medusajs.com/api/store#carts_postcartsidlineitems) requires two request body parameters:

- `variant_id`: The ID of the product variant to add to the cart. This is the variant selected by the customer.
- `quantity`: The quantity to add to cart.

The API route returns the updated [cart object](https://docs.medusajs.com/api/store#carts_cart_schema).

***

## Update Line Item in Cart

You can update the quantity of a line item in the cart using the [Update Line Item API route](https://docs.medusajs.com/api/store#carts_postcartsidlineitemsline_id).

For example:

```ts highlights={updateHighlights}
const updateQuantity = (
  itemId: string,
  quantity: number
) => {
  const cartId = localStorage.getItem("cart_id")

  if (!cartId) {
    return
  }

  sdk.store.cart.updateLineItem(cartId, itemId, {
    quantity,
  })
  .then(({ cart }) => {
    // use cart
    console.log(cart)
  })
}
```

The [Update Line Item API route](https://docs.medusajs.com/api/store#carts_postcartsidlineitemsline_id) requires:

- The line item's ID to be passed as a path parameter.
- The `quantity` request body parameter, which is the new quantity of the item.

The API route returns the updated [cart object](https://docs.medusajs.com/api/store#carts_cart_schema).

***

## Remove Line Item from Cart

To remove a line item from the cart, send a request to the [Remove Line Item API route](https://docs.medusajs.com/api/store#carts_deletecartsidlineitemsline_id).

For example:

```ts highlights={deleteHighlights}
const removeItem = (itemId: string) => {
  const cartId = localStorage.getItem("cart_id")

  if (!cartId) {
    return
  }

  sdk.store.cart.deleteLineItem(cartId, itemId)
  .then(({ parent: cart }) => {
    // use cart
    console.log(cart)
  })
}
```

The [Delete Line Item API route](https://docs.medusajs.com/api/store#carts_deletecartsidlineitemsline_id) returns the updated [cart object](https://docs.medusajs.com/api/store#carts_cart_schema) as the `parent` field.

# Manage Cart Promotions in Storefront

In this guide, you'll learn how to manage cart promotions or discounts, including adding, listing, and removing them.

## Add Promotion to Cart

To add a promotion to a cart, use the [Add Promotion API route](https://docs.medusajs.com/api/store#carts_postcartsidpromotions).

For example:

```ts
fetch(`http://localhost:9000/store/carts/${cart.id}/promotions`, {
  credentials: "include",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-publishable-api-key": 
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "temp",
  },
  body: JSON.stringify({
    promo_codes: [promoCode],
  }),
})
.then((res) => res.json())
.then(({ cart }) => {
  // use cart...
  console.log(cart)
})
```

The [Add Promotion API route](https://docs.medusajs.com/api/store#carts_postcartsidpromotions) accepts the cart ID as a path parameter, and a `promo_codes` request body parameter, which is an array of promotion codes to apply to the cart.

The response includes the updated cart with the applied promotions. You can use this cart object to show the updated promotions to the customer.

***

## List Cart Promotions

The cart object you retrieve in the storefront has a `promotions` field, which is an array of the promotions applied to the cart.

You can refer to the [API reference](https://docs.medusajs.com/api/store#carts_cart_schema) for the expected fields in a promotion object.

A promotion mainly has a `code` field. You can use that code to display the applied promotions to the customer, and later to [remove a promotion](#remove-promotion-from-cart) from the cart.

For example, if you have a cart object retrieved from Medusa's Store APIs, you can list its promotions as follows:

```tsx
<div>
  {cart?.promotions?.length ? (
    <ul>
      {cart.promotions.map((promo) => (
        <li key={promo.id}>{promo.code}
          <button onClick={() => removePromotion(promo.code!)}>Remove</button>
        </li>
      ))}
    </ul>
  ) : (
    <p>No promotions applied</p>
  )}
</div>
```

In the above example, you show the list of applied promotions, and for each promotion, you provide a button to [remove it from the cart](#remove-promotion-from-cart).

To show the total discount amount from the applied promotions, refer to the [Cart Totals guide](https://docs.medusajs.com/storefront-development/cart/totals).

***

## Remove Promotion from Cart

To remove a promotion from a cart, use the [Remove Promotion API route](https://docs.medusajs.com/api/store#carts_deletecartsidpromotions).

For example:

```ts
fetch(`http://localhost:9000/store/carts/${cart.id}/promotions`, {
  credentials: "include",
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    "x-publishable-api-key": 
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "temp",
  },
  body: JSON.stringify({
    promo_codes: [code],
  }),
})
.then((res) => res.json())
.then(({ cart }) => {
  // use cart...
  console.log(cart)
})
```

The [Remove Promotion API route](https://docs.medusajs.com/api/store#carts_deletecartsidpromotions) accepts the cart ID as a path parameter, and a `promo_codes` request body parameter, which is an array of promotion codes to remove from the cart.

The response includes the updated cart with the removed promotions. You can use this cart object to show the updated promotions to the customer.


---

The best way to deploy Medusa is through Medusa Cloud where you get autoscaling production infrastructure fine tuned for Medusa. Create an account by signing up at cloud.medusajs.com/signup.

# Show Cart Totals

In this guide, you'll learn how to show the cart totals in the checkout flow. This is usually shown as part of the checkout and cart pages.

## Cart Total Fields

The `Cart` object has various fields related to its totals, which you can check out in the [Store API reference](https://docs.medusajs.com/api/store#carts_cart_schema).

The fields that are most commonly used are:

|Field|Description|
|---|---|---|
|\`subtotal\`|The cart's subtotal before discounts, excluding taxes. Calculated as the sum of |
|\`discount\_total\`|The total amount of discounts applied to the cart, including the tax portion of discounts.|
|\`shipping\_total\`|The sum of all shipping methods' totals after discounts, including taxes.|
|\`tax\_total\`|The cart's tax total after discounts. Calculated as the sum of |
|\`total\`|The cart's final total after discounts and credit lines, including taxes.|

***

## Example: Show Cart Totals in React Storefront

Here's an example of how you can show the cart totals in a React component:

This example uses the `useCart` hook from the [Cart Context](https://docs.medusajs.com/storefront-development/cart/context) to retrieve the cart.

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useCart } from "@/providers/cart"

export default function CartTotals() {
  const { cart } = useCart()

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cart?.currency_code || "USD",
    })
    .format(amount)
  }

  return (
    <div>
      {!cart && <span>Loading...</span>}
      {cart && (
        <ul>
          <li>
            <span>Subtotal (excl. taxes)</span>
            <span>{formatPrice(cart.subtotal ?? 0)}</span>
          </li>
          <li>
            <span>Discounts</span>
            <span>{formatPrice(cart.discount_total ?? 0)}</span>
          </li>
          <li>
            <span>Shipping</span>
            <span>{formatPrice(cart.shipping_total ?? 0)}</span>
          </li>
          <li>
            <span>Taxes</span>
            <span>{formatPrice(cart.tax_total ?? 0)}</span>
          </li>
          <li>
            <span>Total</span>
            <span>{formatPrice(cart.total ?? 0)}</span>
          </li>
        </ul>
      )}
    </div>
  )
}
```

In the example, you first retrieve the cart using the [Cart Context](https://docs.medusajs.com/storefront-development/cart/context). Then, you define the [formatPrice](https://docs.medusajs.com/storefront-development/cart/retrieve#format-prices) function to format the total amounts.

Finally, you render the cart totals in a list, showing the subtotal, discounts, shipping, taxes, and the total amount.

***

## Retrieve and Show Cart Item Totals

You can also show the totals specific to each item in the cart. This is useful when you want to show the price breakdown for each item, such as price before and after discounts.

The cart item totals aren't included by default in the cart object. You need to explicitly expand the `items.*` relation when retrieving the cart. This will add item totals like `total`, `subtotal`, `tax_total`, and `discount_total` to each item object in the cart. You can learn about other total fields in the [Store API reference](https://docs.medusajs.com/api/store#carts_cart_schema).

For example, when retrieving the cart, you can expand the `items.*` relation like this:

```ts
sdk.store.cart.retrieve(cartId, {
  fields: "+items.*",
  // TIP: You can also expand both items and shipping methods at the same time
  // fields: "+items.*, +shipping_methods.*",
})
.then(({ cart: dataCart }) => {
  setCart(dataCart)
})
```

Then, you can show the item totals in a React component like this:

```tsx
"use client" // include with Next.js 13+

import { HttpTypes } from "@medusajs/types"

type CartItemTotalsProps = {
  cart: HttpTypes.StoreCart
}

export default function CartItemTotals({
  cart,
}: CartItemTotalsProps) {
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cart.currency_code,
    })
    .format(amount)
  }

  return (
    <ul>
      {cart.items.map((item) => (
        <li key={item.id}>
          <span>{item.title}</span>
          <span>{formatPrice(item.total!)}</span>
          <span>(Subtotal: {formatPrice(item.subtotal!)})</span>
          <span>(Discounts: {formatPrice(item.discount_total!)})</span>
          <span>(Taxes: {formatPrice(item.tax_total!)})</span>
        </li>
      ))}
    </ul>
  )
}
```

In the example, you receive the cart with the expanded item totals as a prop. Then, you define the [formatPrice](https://docs.medusajs.com/storefront-development/cart/retrieve#format-prices) function to format the total amounts.

Finally, you render the cart items in a list, showing each item's title, total, subtotal, discounts, and taxes.

***

## Retrieve and Show Shipping Method Totals

You can also show the totals specific to each shipping method in the cart. This is useful when you want to show the price breakdown for each shipping method, such as price before and after discounts.

The cart shipping method totals aren't included by default in the cart response. You need to explicitly expand the `shipping_methods.*` relation when retrieving the cart. This will add shipping method totals like `total`, `subtotal`, `tax_total`, and `discount_total` to each shipping method object in the cart. You can learn about other total fields in the [Store API reference](https://docs.medusajs.com/api/store#carts_cart_schema).

For example, when retrieving the cart, you can expand the `shipping_methods.*` relation like this:

```ts
sdk.store.cart.retrieve(cartId, {
  fields: "+shipping_methods.*",
  // TIP: You can also expand both items and shipping methods at the same time
  // fields: "+items.*, +shipping_methods.*",
})
.then(({ cart: dataCart }) => {
  setCart(dataCart)
})
```

Then, you can show the shipping method totals in a React component like this:

```tsx
"use client" // include with Next.js 13+

import { HttpTypes } from "@medusajs/types"

type CartShippingMethodTotalsProps = {
  cart: HttpTypes.StoreCart
}

export default function CartShippingMethodTotals({
  cart,
}: CartShippingMethodTotalsProps) {
  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cart.currency_code,
    })
    .format(amount)
  }

  return (
    <ul>
      {cart.shipping_methods.map((method) => (
        <li key={method.id}>
          <span>{method.name}</span>
          <span>{formatPrice(method.total!)}</span>
          <span>(Subtotal: {formatPrice(method.subtotal!)})</span>
          <span>(Discounts: {formatPrice(method.discount_total!)})</span>
          <span>(Taxes: {formatPrice(method.tax_total!)})</span>
        </li>
      ))}
    </ul>
  )
}
```

In the example, you receive the cart with the expanded shipping method totals as a prop. Then, you define the [formatPrice](https://docs.medusajs.com/storefront-development/cart/retrieve#format-prices) function to format the total amounts.

Finally, you render the cart shipping methods in a list, showing each method's name, total, subtotal, discounts, and taxes.


