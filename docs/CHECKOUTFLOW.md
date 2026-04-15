
# Checkout in Storefront

Once a customer finishes adding products to cart, they go through the checkout flow to place their order.

The checkout flow is composed of five steps:

1. [Email](https://docs.medusajs.com/storefront-development/checkout/email): Enter customer email. For logged-in customer, you can pre-fill it.
2. [Address](https://docs.medusajs.com/storefront-development/checkout/address): Enter shipping/billing address details.
3. [Shipping](https://docs.medusajs.com/storefront-development/checkout/shipping): Choose a shipping method.
4. [Payment](https://docs.medusajs.com/storefront-development/checkout/payment): Choose a payment provider.
5. [Complete Cart](https://docs.medusajs.com/storefront-development/checkout/complete-cart): Perform any payment action necessary (for example, enter card details), complete the cart, and place the order.

You can combine steps or change their order based on your desired checkout flow. Once the customer places the order, you can show them an [order confirmation page](https://docs.medusajs.com/storefront-development/checkout/order-confirmation).

Refer to the [Express Checkout Tutorial](https://docs.medusajs.com/storefront-development/guides/express-checkout) for a complete example of a different checkout flow.


---

The best way to deploy Medusa is through Medusa Cloud where you get autoscaling production infrastructure fine tuned for Medusa. Create an account by signing up at cloud.medusajs.com/signup.

# Checkout Step 1: Enter Email

In this guide, you'll learn how to add an email step to the checkout flow. This typically would be the first step of the checkout flow, but you can also change the steps of the checkout flow as you see fit.

When the user enters their email, use the [Update Cart API route](https://docs.medusajs.com/api/store#carts_postcartsid) to update the cart with the email.

If the customer is logged-in, you can pre-fill the email with the customer's email.

For example:

- This example uses the `useCart` hook defined in the [Cart React Context guide](https://docs.medusajs.com/storefront-development/cart/context).
- Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

### React

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useEffect, useState } from "react"
import { useCart } from "@/providers/cart"
import { sdk } from "@/lib/sdk"

export default function CheckoutEmailStep() {
  const { cart, setCart } = useCart()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cart && !cart.items?.length) {
      // TODO redirect to another path
    }
  }, [cart])

  const updateCartEmail = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!cart || !email.length) {
      return
    }

    e.preventDefault()
    setLoading(true)

    sdk.store.cart.update(cart.id, {
      email,
    })
    .then(({ cart: updatedCart }) => {
      setCart(updatedCart)
    })
    .finally(() => setLoading(false))
  }

  return (
    <div>
      {!cart && <span>Loading...</span>}
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        disabled={!cart}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        disabled={!cart || !email || loading}
        onClick={updateCartEmail}
      >
        Set Email
      </button>
    </div>
  )
}
```

### JS SDK

```ts
const cartId = localStorage.getItem("cart_id")

sdk.store.cart.update(cart.id, {
  email,
})
.then(({ cart }) => {
  // use cart...
  console.log(cart)
})
```

After the customer enters and submits their email, you send a request to the [Update Cart API route](https://docs.medusajs.com/api/store#carts_postcartsid) passing it the email in the request body.

Notice that if the cart doesn't have items, you should redirect to another page as the checkout requires at least one item in the cart. Redirecting to another page is not covered in this guide as this depends on the storefront framework you're using.

# Checkout Step 2: Set Shipping and Billing Addresses

In this guide, you'll learn how to set the cart's shipping and billing addresses. This typically should be the second step of the checkout flow, but you can also change the steps of the checkout flow as you see fit.

## Approaches to Set the Cart's Addresses

A cart has shipping and billing addresses that customers need to set. You can either:

- [Show a form to enter the address](#approach-one-address-form);
- Or [allow the customer to pick an address from their account](#approach-two-select-customer-address).

This guide shows you how to implement both approaches. You can choose either or combine them, based on your use case.

***

## Approach One: Address Form

The first approach to setting the cart's shipping and billing addresses is to show a form to the customer to enter their address details.

Then, to update the cart's address, use the [Update Cart API route](https://docs.medusajs.com/api/store#carts_postcartsid).

For example:

- This example uses the `useCart` hook defined in the [Cart React Context guide](https://docs.medusajs.com/storefront-development/cart/context).
- Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

### React

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useState } from "react"
import { useCart } from "@/providers/cart"
import { sdk } from "@/lib/sdk"

export default function CheckoutAddressStep() {
  const { cart, setCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address1, setAddress1] = useState("")
  const [company, setCompany] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [city, setCity] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [province, setProvince] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  const updateAddress = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!cart) {
      return
    }

    e.preventDefault()
    setLoading(true)

    const address = {
      first_name: firstName,
      last_name: lastName,
      address_1: address1,
      company,
      postal_code: postalCode,
      city,
      country_code: countryCode || cart.region?.countries?.[0].iso_2,
      province,
      phone: phoneNumber,
    }

    sdk.store.cart.update(cart.id, {
      shipping_address: address,
      billing_address: address,
    })
    .then(({ cart: updatedCart }) => {
      setCart(updatedCart)
      console.log(updatedCart)
    })
    .finally(() => setLoading(false))
  }
  
  return (
    <form>
      {!cart && <span>Loading...</span>}
      <input 
        type="text" 
        placeholder="First Name" 
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Last Name" 
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Address Line" 
        value={address1}
        onChange={(e) => setAddress1(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Company" 
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="Postal Code" 
        value={postalCode}
        onChange={(e) => setPostalCode(e.target.value)}
      />
      <input 
        type="text" 
        placeholder="City" 
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <select
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
      >
        {cart?.region?.countries?.map((country) => (
          <option 
            key={country.iso_2}
            value={country.iso_2}
          >
            {country.display_name}
          </option>
        ))}
      </select>
      <input 
        type="text" 
        placeholder="Province" 
        value={province}
        onChange={(e) => setProvince(e.target.value)}
      />
      <input 
        type="tel" 
        placeholder="Phone Number" 
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button
        disabled={!cart || loading}
        onClick={updateAddress}
      >
        Save
      </button>
    </form>
  )
}
```

### JS SDK

```ts
const cartId = localStorage.getItem("cart_id")

const address = {
  first_name,
  last_name,
  address_1,
  company,
  postal_code,
  city,
  country_code,
  province,
  phone,
}

sdk.store.cart.update(cart.id, {
  shipping_address: address,
  billing_address: address,
})
.then(({ cart }) => {
  // use cart...
  console.log(cart)
})
```

In the example above:

- The same address is used for shipping and billing for simplicity. You can provide the option to enter both addresses instead.
- You send the address to the Update Cart API route under the `shipping_address` and `billing_address` request body parameters.
- The updated cart object is returned in the response.
- **React example:** in the address, the chosen country must be in the cart's region. So, only the countries part of the cart's region are shown in the Country input.

***

## Approach Two: Select Customer Address

The second approach to setting the cart's shipping and billing addresses is to allow the logged-in customer to select an address they added previously to their account.

To retrieve the logged-in customer's addresses, use the [List Customer Addresses API route](https://docs.medusajs.com/api/store#customers_getcustomersmeaddresses). Then, once the customer selects an address, use the [Update Cart API route](https://docs.medusajs.com/api/store#carts_postcartsid) to update the cart's addresses.

A customer's address and a cart's address are represented by different data models in the Medusa application, as they're managed by the [Customer Module](https://docs.medusajs.com/commerce-modules/customer) and the [Cart Module](https://docs.medusajs.com/commerce-modules/cart), respectively. So, addresses that the customer used previously during checkout aren't automatically saved to their account. You need to save the customer's address using the [Create Customer Address API route](https://docs.medusajs.com/api/store#customers_postcustomersmeaddresses).

For example:

- This example uses the `useCart` hook defined in the [Cart React Context guide](https://docs.medusajs.com/storefront-development/cart/context).
- This example uses the `useCustomer` hook defined in the [Customer React Context guide](https://docs.medusajs.com/storefront-development/customers/context).

### React

```tsx highlights={react2Highlights}
"use client" // include with Next.js 13+

import { useEffect, useState } from "react"
import { useCart } from "@/providers/cart"
import { useCustomer } from "@/providers/customer"
import { sdk } from "@/lib/sdk"

export default function CheckoutAddressStep() {
  const { cart, setCart } = useCart()
  const { customer } = useCustomer()
  const [loading, setLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(customer?.addresses[0]?.id || "")

  useEffect(() => {
    if (!customer) {
      // TODO you can redirect here to another page or component that shows the address form
    }
    setSelectedAddress(customer?.addresses[0]?.id || "")
  }, [customer])

  const updateAddress = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()

    const customerAddress = customer?.addresses.find((address) => address.id === selectedAddress)
    if (!cart || !customerAddress) {
      return
    }
    setLoading(true)

    const address = {
      first_name: customerAddress.first_name || "",
      last_name: customerAddress.last_name || "",
      address_1: customerAddress.address_1 || "",
      company: customerAddress.company || "",
      postal_code: customerAddress.postal_code || "",
      city: customerAddress.city || "",
      country_code: customerAddress.country_code || cart.region?.countries?.[0].iso_2,
      province: customerAddress.province || "",
      phone: customerAddress.phone || "",
    }

    sdk.store.cart.update(cart.id, {
      shipping_address: address,
      billing_address: address,
    })
    .then(({ cart: updatedCart }) => {
      setCart(updatedCart)
    })
    .finally(() => setLoading(false))
  }
  
  return (
    <form>
      {!cart && <span>Loading...</span>}
      {!customer?.addresses.length && <span>Customer doesn't have addresses</span>}
      <select value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)}>
        {customer?.addresses.map((address) => (
          <option value={address.id} key={address.id}>{address.country_code}</option>
        ))}
      </select>
      <button
        disabled={!cart || loading || !selectedAddress}
        onClick={updateAddress}
      >
        Save
      </button>
    </form>
  )
}
```

### JS SDK

```ts highlights={fetch2Highlights}
const cartId = localStorage.getItem("cart_id")

const retrieveCustomerAddresses = () => {
  sdk.store.customer.listAddress()
  .then(({ addresses }) => {
    // use addresses...
    console.log(addresses)
  })
}

const updateCartAddress = (customerAddress: Record<string, unknown>) => {
  const address = {
      first_name: customerAddress.first_name || "",
      last_name: customerAddress.last_name || "",
      address_1: customerAddress.address_1 || "",
      company: customerAddress.company || "",
      postal_code: customerAddress.postal_code || "",
      city: customerAddress.city || "",
      country_code: customerAddress.country_code || cart.region?.countries?.[0].iso_2,
      province: customerAddress.province || "",
      phone: customerAddress.phone || "",
    }

    sdk.store.cart.update(cart.id, {
      shipping_address: address,
      billing_address: address,
    })
    .then(({ cart: updatedCart }) => {
      // use cart...
      console.log(cart)
    })
}
```

In the example above, you retrieve the customer's addresses and, when the customer selects an address, you update the cart's shipping and billing addresses with the selected address.

The JS SDK automatically sends an authenticated request as the logged-in customer as explained in the [Login Customer guide](https://docs.medusajs.com/storefront-development/customers/login). If you're using the Fetch API, you can either use `credentials: include` if the customer is already authenticated with a cookie session, or pass the Authorization Bearer token in the request's header.

In the React example, you use the [Customer React Context](https://docs.medusajs.com/storefront-development/customers/context) to retrieve the logged-in customer, who has a list of addresses. You show a select input to select an address.

When the customer selects an address, you send a request to [Update Cart API route](https://docs.medusajs.com/api/store#carts_postcartsid) passing the selected address as a shipping and billing address.

# Checkout Step 3: Choose Shipping Method

In this guide, you'll learn how to implement the third step of the checkout flow, where the customer chooses the shipping method to receive their order's items. While this is typically the third step of the checkout flow, you can change the steps of the checkout flow as you see fit.

## Shipping Flow in Storefront Checkout

To allow the customer to choose a shipping method, you:

![Diagram showing the different steps of the shipping flow in storefront checkout](https://res.cloudinary.com/dza7lstvk/image/upload/v1743085465/Medusa%20Resources/shipping-checkout-flow_mfzdsh.jpg)

1. Retrieve the available shipping options for the cart using the [List Shipping Options API route](https://docs.medusajs.com/api/store#shipping-options_getshippingoptions) and show them to the customer.
2. For shipping options whose `price_type=calculated`, you retrieve their calculated price using the [Calculate Shipping Option Price API Route](https://docs.medusajs.com/api/store#shipping-options_postshippingoptionsidcalculate).
   - The Medusa application calculates the price using the associated fulfillment provider's logic, which may require sending a request to a third-party service.
3. When the customer chooses a shipping option, you use the [Add Shipping Method to Cart API route](https://docs.medusajs.com/api/store#carts_postcartsidshippingmethods) to set the cart's shipping method.

***

## How to Implement the Shipping Flow in Storefront Checkout?

For example:

- This example uses the `useCart` hook defined in the [Cart React Context guide](https://docs.medusajs.com/storefront-development/cart/context).
- Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

### React

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useCallback, useEffect, useState } from "react"
import { useCart } from "@/providers/cart"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/sdk"

export default function CheckoutShippingStep() {
  const { cart, setCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<
    HttpTypes.StoreCartShippingOption[]
  >([])
  const [calculatedPrices, setCalculatedPrices] = useState<
    Record<string, number>
  >({})
  const [
    selectedShippingOption, 
    setSelectedShippingOption,
  ] = useState<string | undefined>()

  useEffect(() => {
    if (!cart) {
      return
    }
    sdk.store.fulfillment.listCartOptions({
      cart_id: cart.id,
    })
    .then(({ shipping_options }) => {
      setShippingOptions(shipping_options)
    })
  }, [cart])

  useEffect(() => {
    if (!cart || !shippingOptions.length) {
      return
    }

    const promises = shippingOptions
        .filter((shippingOption) => shippingOption.price_type === "calculated")
        .map((shippingOption) => 
          sdk.store.fulfillment.calculate(shippingOption.id, {
            cart_id: cart.id,
            data: {
              // pass any data useful for calculation with third-party provider.
            },
          })
        )

    if (promises.length) {
      Promise.allSettled(promises).then((res) => {
        const pricesMap: Record<string, number> = {}
        res
          .filter((r) => r.status === "fulfilled")
          .forEach((p) => (pricesMap[p.value?.shipping_option.id || ""] = p.value?.shipping_option.amount))

        setCalculatedPrices(pricesMap)
      })
    }
  }, [shippingOptions, cart])

  const setShipping = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    if (!cart || !selectedShippingOption) {
      return
    }

    e.preventDefault()
    setLoading(true)

    sdk.store.cart.addShippingMethod(cart.id, {
      option_id: selectedShippingOption,
      data: {
        // TODO add any data necessary for
        // fulfillment provider
      },
    })
    .then(({ cart: updatedCart }) => {
      setCart(updatedCart)
    })
    .finally(() => setLoading(false))
  }

  const formatPrice = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cart?.currency_code,
    })
    .format(amount)
  }

  const getShippingOptionPrice = useCallback((shippingOption: HttpTypes.StoreCartShippingOption) => {
    if (shippingOption.price_type === "flat") {
      return formatPrice(shippingOption.amount)
    }

    if (!calculatedPrices[shippingOption.id]) {
      return
    }

    return formatPrice(calculatedPrices[shippingOption.id])
  }, [calculatedPrices])

  return (
    <div>
      {loading || !cart && <span>Loading...</span>}
      <form>
        <select 
          value={selectedShippingOption}
          onChange={(e) => setSelectedShippingOption(
            e.target.value
          )}
        >
          {shippingOptions.map((shippingOption) => {
            const price = getShippingOptionPrice(shippingOption)
            
            return (
              <option
                key={shippingOption.id}
                value={shippingOption.id}
                disabled={price === undefined}
              >
                {shippingOption.name} - {price}
              </option>
            )
          })}
        </select>
        <button
          disabled={loading || !cart}
          onClick={setShipping}
        >
          Save
        </button>
      </form>
    </div>
  )
}
```

### JS SDK

```ts highlights={fetchHighlights}
const cartId = localStorage.getItem("cart_id")
let shippingOptions = []
const calculatedPrices: Record<string, number> = {}

const retrieveShippingOptions = () => {
  const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
    cart_id: cartId,
  })

  shippingOptions = shipping_options
}

const calculateShippingOptionPrices = () => {
  const promises = shippingOptions
      .filter((shippingOption) => shippingOption.price_type === "calculated")
      .map((shippingOption) => 
        sdk.store.fulfillment.calculate(shippingOption.id, {
          cart_id: cartId,
          data: {
            // pass any data useful for calculation with third-party provider.
          },
        })
      )

  if (promises.length) {
    Promise.allSettled(promises).then((res) => {
      res
        .filter((r) => r.status === "fulfilled")
        .forEach(
          (p) => (
            calculatedPrices[p.value?.shipping_option.id || ""] = 
              p.value?.shipping_option.amount
          )
        )
    })
  }
}

const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    // assuming you have access to the cart object.
    currency: cart?.currency_code,
  })
  .format(amount)
}

const getShippingOptionPrice = (shippingOption: HttpTypes.StoreCartShippingOption) => {
  if (shippingOption.price_type === "flat") {
    return formatPrice(shippingOption.amount)
  }

  if (!calculatedPrices[shippingOption.id]) {
    return
  }

  return formatPrice(calculatedPrices[shippingOption.id])
}

const setShippingMethod = (
  selectedShippingOptionId: string
) => {
  sdk.store.cart.addShippingMethod(cartId, {
    option_id: selectedShippingOptionId,
    data: {
      // TODO add any data necessary for
      // fulfillment provider
    },
  })
  .then(({ cart }) => {
    // use cart...
    console.log(cart)
  })
}
```

In the example above, you:

- Retrieve the available shipping options of the cart to allow the customer to select from them using the [List Shipping Options API route](https://docs.medusajs.com/api/store#shipping-options_getshippingoptions).
- For each shipping option, you retrieve its calculated price from the Medusa application using the [Calculate Shipping Option Price API Route](https://docs.medusajs.com/api/store#shipping-options_postshippingoptionsidcalculate).
- Once the customer selects a shipping option, you send a request to the [Add Shipping Method to Cart API route](https://docs.medusajs.com/api/store#carts_postcartsidshippingmethods) to update the cart's shipping method using the selected shipping option.

### data Request Body Parameter

When calculating a shipping option's price using the [Calculate Shipping Option Price API Route](https://docs.medusajs.com/api/store#shipping-options_postshippingoptionsidcalculate), or when setting the shipping method using the [Add Shipping Method to Cart API route](https://docs.medusajs.com/api/store#carts_postcartsidshippingmethods), you can pass a `data` request body parameter that holds data relevant for the fulfillment provider.

For example, you may pass a custom carrier code to the `data` parameter to identify the carrier of the shipping option if your fulfillment provider requires it.

This isn't implemented here as it's different for each provider. Refer to your fulfillment provider's documentation on details of expected data, if any.


# Checkout Step 4: Choose Payment Provider

In this guide, you'll learn how to implement the last step of the checkout flow, where the customer chooses the payment provider and performs any necessary actions. This is typically the fourth step of the checkout flow, but you can change the steps of the checkout flow as you see fit.

## Payment Step Flow in Storefront Checkout

The payment step requires implementing the following flow:

![Storefront payment checkout flow diagram illustrating the complete payment process: retrieving available payment providers, customer selection of payment method, payment collection creation, session initialization, and showing the necessary UI to complete the payment](https://res.cloudinary.com/dza7lstvk/image/upload/v1718029777/Medusa%20Resources/storefront-payment_dxry7l.jpg)

1. Retrieve the payment providers using the [List Payment Providers API route](https://docs.medusajs.com/api/store#payment-providers_getpaymentproviders).
2. Customer chooses the payment provider to use.
3. If the cart doesn't have an associated payment collection, create a payment collection for it using the [Create Payment Collection API route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollections).
4. Initialize the payment sessions of the cart's payment collection using the [Initialize Payment Sessions API route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollectionsidpaymentsessions).
   - If you're using the JS SDK, it combines the third and fourth steps in a single `initiatePaymentSession` function.
5. Optionally perform additional actions for payment based on the chosen payment provider. For example, if the customer chooses Stripe, you show them the UI to enter their card details.
   - You can refer to the [Stripe guide](https://docs.medusajs.com/storefront-development/checkout/payment/stripe) for an example of how to implement this.

***

## How to Implement the Payment Step Flow

For example, to implement the payment step flow:

- This example uses the `useCart` hook defined in the [Cart React Context guide](https://docs.medusajs.com/storefront-development/cart/context).
- Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

### React

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useCallback, useEffect, useState } from "react"
import { useCart } from "@/providers/cart"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/sdk"

export default function CheckoutPaymentStep() {
  const { cart, setCart } = useCart()
  const [paymentProviders, setPaymentProviders] = useState<
    HttpTypes.StorePaymentProvider[]
  >([])
  const [
    selectedPaymentProvider, 
    setSelectedPaymentProvider,
  ] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cart) {
      return
    }

    sdk.store.payment.listPaymentProviders({
      region_id: cart.region_id || "",
    })
    .then(({ payment_providers }) => {
      setPaymentProviders(payment_providers)
      setSelectedPaymentProvider(
        cart.payment_collection?.payment_sessions?.[0]?.id
      )
    })
  }, [cart])

  const handleSelectProvider = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()
    if (!cart || !selectedPaymentProvider) {
      return
    }

    setLoading(true)

    await sdk.store.payment.initiatePaymentSession(cart, {
      provider_id: selectedPaymentProvider,
    })

    // re-fetch cart
    const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id)

    setCart(updatedCart)
    setLoading(false)
  }

  const getPaymentUi = useCallback(() => {
    const activePaymentSession = cart?.payment_collection?.payment_sessions?.[0]
    if (!activePaymentSession) {
      return
    }

    switch(true) {
      case activePaymentSession.provider_id.startsWith("pp_stripe_"):
        return (
          <span>
            You chose stripe!
            {/* TODO add stripe UI */}
          </span>
        )
      case activePaymentSession.provider_id
        .startsWith("pp_system_default"):
        return (
          <span>
            You chose manual payment! No additional actions required.
          </span>
        )
      default:
        return (
          <span>
            You chose {activePaymentSession.provider_id} which is 
            in development.
          </span>
        )
    }
  } , [cart])

  return (
    <div>
      <form>
        <select 
          value={selectedPaymentProvider}
          onChange={(e) => setSelectedPaymentProvider(e.target.value)}
        >
          {paymentProviders.map((provider) => (
            <option
              key={provider.id}
              value={provider.id}
            >
              {provider.id}
            </option>
          ))}
        </select>
        <button
          disabled={loading} 
          onClick={async (e) => {
            await handleSelectProvider(e)
          }}
        >
          Submit
        </button>
      </form>
      {getPaymentUi()}
    </div>
  )
}
```

### JS SDK

```ts highlights={fetchHighlights}
// assuming the cart is previously fetched
const cart = {
  id: "cart_123",
  region_id: "reg_123",
  // cart object...
}

const retrievePaymentProviders = async () => {
  const { payment_providers } = await sdk.store.payment.listPaymentProviders({
    region_id: cart.region_id || "",
  })

  return payment_providers
}

const selectPaymentProvider = async (
  selectedPaymentProviderId: string
) => {
  await sdk.store.payment.initiatePaymentSession(cart, {
    provider_id: selectedPaymentProviderId,
  })

  // re-fetch cart
  const { 
    cart: updatedCart,
  } = await sdk.store.cart.retrieve(cart.id)

  return updatedCart
}

const getPaymentUi = () => {
  const activePaymentSession = cart?.payment_collection?.
    payment_sessions?.[0]
  if (!activePaymentSession) {
    return
  }

  switch(true) {
    case activePaymentSession.provider_id.startsWith("pp_stripe_"):
      // TODO handle Stripe UI
      return "You chose stripe!"
    case activePaymentSession.provider_id
      .startsWith("pp_system_default"):
      return "You chose manual payment! No additional actions required."
    default:
      return `You chose ${
        activePaymentSession.provider_id
      } which is in development.`
  }
}

const handlePayment = () => {
  retrievePaymentProviders()

  // ... customer chooses payment provider
  // const providerId = ...

  selectPaymentProvider(providerId)

  getPaymentUi()
}
```

In the example above, you:

- Retrieve the payment providers from the Medusa application using the [List Payment Providers API route](https://docs.medusajs.com/api/store#payment-providers_getpaymentproviders). You use those to show the customer the available options.
- When the customer chooses a payment provider, you use the `initiatePaymentSession` function to create a payment collection and initialize the payment session for the chosen provider.
  - If you're not using the JS SDK, you need to create a payment collection using the [Create Payment Collection API route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollections) if the cart doesn't have one. Then, you need to initialize the payment session using the [Initialize Payment Session API route](https://docs.medusajs.com/api/store#payment-collections_postpaymentcollectionsidpaymentsessions).
- Once the cart has a payment session, you optionally render the UI to perform additional actions. For example, if the customer chose Stripe, you can show them the card form to enter their credit card.

In the `Fetch API` example, the `handlePayment` function implements this flow by calling the different functions in the correct order.

***

## Troubleshooting

### Unknown Error for Zero Cart Total

If your cart has a total of `0`, you might encounter an `unknown error` when trying to create a payment session.

Some payment providers, such as Stripe, require a non-zero amount to create a payment session. So, if your cart has a total of `0`, the error will be thrown on the payment provider's side.

In those cases, you can either:

- Make sure the payment session is only initialized when the cart has a total greater than `0`.
- Use payment providers like the Manual System Payment Provider, which doesn't create a payment session with a third-party provider.
  - The Manual System Payment Provider is available by default in Medusa and can be used to handle payments without a third-party provider. It allows you to mark the order as paid without requiring any additional actions from the customer.
  - Make sure to configure the Manual System Payment Provider in your store's region. Learn more in the [Manage Region](https://docs.medusajs.com/user-guide/settings/regions#edit-region-details) user guide.

***

## Stripe Example

If you're integrating Stripe in your Medusa application and storefront, refer to the [Stripe guide](https://docs.medusajs.com/storefront-development/checkout/payment/stripe) for an example of how to handle the payment process using Stripe.

# Checkout Step 5: Complete Cart

In this guide, you'll learn how to complete the cart and place the order. This is the last step of your checkout flow.

## How to Complete Cart in Storefront Checkout

Once you finish any required actions with the third-party payment provider, you can complete the cart and place the order.

To complete the cart, send a request to the [Complete Cart API route](https://docs.medusajs.com/api/store#carts_postcartsidcomplete). For example:

Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

```ts
sdk.store.cart.complete(cart.id)
.then((data) => {
  if (data.type === "cart" && data.cart) {
    // an error occurred
    console.error(data.error)
  } else if (data.type === "order" && data.order) {
    // TODO redirect to order success page
    alert("Order placed.")
    console.log(data.order)
    // unset cart ID from local storage
    localStorage.removeItem("cart_id")
  }
})
```

In the response of the request, the `type` field determines whether the cart completion was successful:

- If the `type` is `cart`, it means the cart completion failed. The `error` response field holds the error details.
- If the `type` is `order`, it means the cart was completed and the order was placed successfully.

When the cart completion is successful, it's important to unset the cart ID from the `localStorage`, as the cart is no longer usable.

***

## Order's Locale after Cart Completion

### Prerequisites

- [Translation Module Configured](https://docs.medusajs.com/commerce-modules/translation#configure-translation-module)

When you complete the cart, items in the order will be in the locale that was set for the cart. This ensures that the customer sees the order details in their preferred language.

If no locale was set for the cart, then the order's items will be in the original product content.

***

## React Example with Default System Payment Provider

For example, to complete the cart when the default system payment provider is used:

This example uses the `useCart` hook defined in the [Cart React Context guide](https://docs.medusajs.com/storefront-development/cart/context).

```tsx highlights={highlights}
"use client" // include with Next.js 13+

import { useState } from "react"
import { useCart } from "@/providers/cart"
import { sdk } from "@/lib/sdk"

export default function SystemDefaultPayment() {
  const { cart, refreshCart } = useCart()
  const [loading, setLoading] = useState(false)

  const handlePayment = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault()

    if (!cart) {
      return
    }

    setLoading(true)
    
    // TODO perform any custom payment handling logic
    
    // complete the cart
    sdk.store.cart.complete(cart.id)
    .then((data) => {
      if (data.type === "cart" && data.cart) {
        // an error occurred
        console.error(data.error)
      } else if (data.type === "order" && data.order) {
        // TODO redirect to order success page
        alert("Order placed.")
        console.log(data.order)
        refreshCart()
      }
    })
    .finally(() => setLoading(false))
  }

  return (
    <button 
      onClick={handlePayment}
      disabled={loading}
    >
      Place Order
    </button>
  )
}
```

In the example above, you create a `handlePayment` function in the payment component. In this function, you:

- Optionally perform any required actions with the third-party payment provider. For example, authorize the payment. For the default system payment provider, no actions are required.
- Send a request to the [Complete Cart API route](https://docs.medusajs.com/api/store#carts_postcartsidcomplete) once all actions with the third-party payment provider are performed.
- In the received response of the request, if the `type` is `cart`, it means that the cart completion failed. The error is set in the `error` response field.
- If the `type` is `order`, it means the card was completed and the order was placed successfully. You can access the order in the `order` response field.
- When the order is placed, you must unset the `cart_id` from the `localStorage`. You can redirect the customer to an order success page at this point. The redirection logic depends on the storefront framework you're using.

***

## React Example with Third-Party Payment Provider

Refer to the [Stripe guide](https://docs.medusajs.com/storefront-development/checkout/payment/stripe) for an example on integrating a third-party provider and implementing card completion.


# Order Confirmation in Storefront

In this guide, you'll learn how to show the different order details on the order confirmation page.

After the customer completes the checkout process and places an order, you can show an order confirmation page to display the order details.

## Retrieve Order Details

To show the order details, you need to retrieve the order by sending a request to the [Get an Order API route](https://docs.medusajs.com/api/store#orders_getordersid).

You need the order's ID to retrieve the order. You can pass it from the [complete cart step](https://docs.medusajs.com/storefront-development/checkout/complete-cart) or store it in the `localStorage`.

The following example assumes you already have the order ID:

Learn how to install and configure the JS SDK in the [JS SDK documentation](https://docs.medusajs.com/js-sdk).

### React

```tsx
"use client" // include with Next.js 13+

import { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"
import { useState } from "react"

export function OrderConfirmation({ id }: { id: string }) {
  const [order, setOrder] = useState<HttpTypes.StoreOrder | undefined>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    sdk.store.order.retrieve(id)
    .then(({ order: dataOrder }) => {
      setOrder(dataOrder)
      setLoading(false)
    })
  }, [id])
  
  return (
    <div>
      {loading && <span>Loading...</span>}
      {!loading && order && (
        <div>
          <h1>Order Confirmation</h1>
          <p>Order ID: {order.id}</p>
          <p>Order Date: {order.created_at.toLocaleString()}</p>
          <p>Order Customer: {order.email}</p>
          {/* TODO show more info */}
        </div>
      )}
    </div>
  )
}
```

### JS SDK

```ts
// orderId is the order ID which you can get from the complete cart step
sdk.store.order.retrieve(orderId)
.then(({ order }) => {
  // use order...
  console.log(order)
})
```

In the above example, you retrieve the order's details from the [Get an Order API route](https://docs.medusajs.com/api/store#orders_getordersid). Then, in the React example, you show the order details like the order ID, order date, and customer email.

The rest of this guide will expand on the React example to show more order details.

Refer to the [Order schema in the API reference](https://docs.medusajs.com/api/store#orders_order_schema) for all the available order fields.

***

## Show Order Items

An order has an `items` field that contains the order items. You can show the order items on the order confirmation page.

For example, add to the React component a `formatPrice` function to format prices with the order's currency:

```tsx
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: order?.currency_code,
  })
  .format(amount)
}
```

Since this is the same function used to format the prices of products and cart totals, you can define the function in one place and re-use it where necessary. In that case, make sure to pass the currency code as a parameter.

Then, you can show the order items in a list:

```tsx
return (
  <div>
    {loading && <span>Loading...</span>}
    {!loading && order && (
      <div>
        {/* ... */}
        <p>
          <span>Order Items</span>
          <ul>
            {order.items?.map((item) => (
              <li key={item.id}>
                {item.title} - {item.quantity} x {formatPrice(item.unit_price)}
              </li>
            ))}
          </ul>
        </p>
        {/* TODO show more details */}
      </div>
    )}
  </div>
)
```

In the above example, you show the order items in a list, displaying the item's title, quantity, and unit price formatted with the `formatPrice` function.

### Locale of Order Items

### Prerequisites

- [Translation Module Configured](https://docs.medusajs.com/commerce-modules/translation#configure-translation-module)

When you complete the cart, items in the order will be in the locale that was set for the cart. This ensures that the customer sees the order details in their preferred language.

If no locale was set for the cart, then the order's items will be in the original product content.

***

## Show Order Totals

An order has various fields for the order totals, which you can check out in the [Order schema in the Store API reference](https://docs.medusajs.com/api/store#orders_order_schema). The most commonly used fields are:

|Field|Description|
|---|---|---|
|\`subtotal\`|The order's subtotal before discounts, excluding taxes. Calculated as the sum of |
|\`discount\_total\`|The total amount of discounts applied to the order, including the tax portion of discounts.|
|\`shipping\_total\`|The sum of all shipping methods' totals after discounts, including taxes.|
|\`tax\_total\`|The order's tax total after discounts. Calculated as the sum of |
|\`total\`|The order's final total after discounts and credit lines, including taxes.|

You can show these totals on the order confirmation page. For example:

```tsx
return (
  <div>
    {loading && <span>Loading...</span>}
    {!loading && order && (
      <div>
        {/* ... */}
        <div>
          <span>Order Totals</span>
          <ul>
            <li>
              <span>Subtotal (excl. taxes)</span>
              <span>{formatPrice(order.subtotal ?? 0)}</span>
            </li>
            <li>
              <span>Discounts</span>
              <span>{formatPrice(order.discount_total ?? 0)}</span>
            </li>
            <li>
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_total ?? 0)}</span>
            </li>
            <li>
              <span>Taxes</span>
              <span>{formatPrice(order.tax_total ?? 0)}</span>
            </li>
            <li>
              <span>Total</span>
              <span>{formatPrice(order.total ?? 0)}</span>
            </li>
          </ul>
        </div>
      </div>
    )}
  </div>
)
```

In the above example, you show the order totals in a list, displaying the subtotal, discounts, shipping, taxes, and total amount formatted with the [formatPrice function](#show-order-items).


-
