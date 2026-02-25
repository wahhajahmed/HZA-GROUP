'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import {
  ShoppingBag, ArrowLeft, Loader2, MapPin, Phone, User, FileText, Package,
} from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { placeOrder } from '@/services/order.service'
import { getAreaChargesByCity, getActiveCities } from '@/services/delivery.service'
import { checkoutSchema, type CheckoutSchema as CheckoutInput } from '@/lib/validations/checkout'
import { formatCurrency, getEffectivePrice } from '@/lib/utils'
import { getCityNames, getAreasByCity } from '@/lib/pakistan-areas'
import {
  calculateDeliveryCharge,
  getEffectiveShippingCategory,
  SHIPPING_CATEGORY_LABELS,
  type ShippingCategory,
} from '@/lib/dc-calculator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { AreaDeliveryCharge } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearItems } = useCartStore()
  const { user } = useAuthStore()

  // Only cities that have area DC configured in DB
  const [activeCities, setActiveCities] = useState<string[]>([])
  // Area charges for the selected city
  const [areaCharges, setAreaCharges] = useState<AreaDeliveryCharge[]>([])
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const totalItems = items.reduce((sum: number, item) => sum + item.quantity, 0)
  const cartSubtotal = subtotal()
  const total = cartSubtotal + deliveryCharge

  // Derive all city names from local data for the select
  const allPakistanCities = useMemo(() => getCityNames(), [])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.full_name || '',
      phone: '',
      address: '',
      city: '',
      area: '',
      notes: '',
    },
  })

  const selectedCity = watch('city')
  const selectedArea = watch('area')

  // Redirect if cart empty on mount
  useEffect(() => {
    if (items.length === 0) router.push('/cart')
  }, [items.length, router])

  // Load active cities from DB on mount
  useEffect(() => {
    getActiveCities().then((res) => {
      if (!res.error && res.data) setActiveCities(res.data)
    })
  }, [])

  // When city changes: fetch area charges + reset area
  useEffect(() => {
    setValue('area', '')
    setDeliveryCharge(0)
    setAreaCharges([])
    if (!selectedCity) return
    getAreaChargesByCity(selectedCity).then((res) => {
      if (!res.error && res.data) setAreaCharges(res.data)
    })
  }, [selectedCity, setValue])

  // When area changes: recalculate DC
  useEffect(() => {
    if (!selectedArea || areaCharges.length === 0) {
      setDeliveryCharge(0)
      return
    }
    const areaRecord = areaCharges.find((a) => a.area === selectedArea)
    if (!areaRecord) {
      setDeliveryCharge(0)
      return
    }
    const dc = calculateDeliveryCharge(
      items.map((item) => ({
        shipping_category: getEffectiveShippingCategory(
          item.product?.shipping_category,
          item.product?.category?.default_shipping_category
        ),
        quantity: item.quantity,
      })),
      {
        small_parcel_charge: areaRecord.small_parcel_charge,
        medium_parcel_charge: areaRecord.medium_parcel_charge,
        bulky_cargo_charge: areaRecord.bulky_cargo_charge,
      }
    )
    setDeliveryCharge(dc)
  }, [selectedArea, areaCharges, items])

  const onSubmit = async (data: CheckoutInput) => {
    if (!user) {
      toast.error('Please log in to place an order')
      router.push('/login?redirect=/checkout')
      return
    }
    setIsPlacingOrder(true)
    try {
      const result = await placeOrder({
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        area: data.area,
        notes: data.notes,
      })
      if (!result.error && result.data) {
        clearItems()
        toast.success('Order placed successfully!')
        router.push(`/orders/${result.data.id}`)
      } else {
        toast.error(result.error || 'Failed to place order. Please try again.')
      }
    } catch {
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Redirecting to cart...</p>
        </div>
      </div>
    )
  }

  // City options: show ALL Pakistan cities; indicate if DC is configured
  const cityOptions = allPakistanCities.map((c) => ({
    value: c,
    label: activeCities.includes(c) ? c : `${c} (no DC set)`,
  }))

  // Area options: from local data (all areas of selected city)
  const localAreas = selectedCity ? getAreasByCity(selectedCity) : []
  // Intersect with areas that have DC configured
  const configuredAreaNames = new Set(areaCharges.map((a) => a.area))
  const areaOptions = localAreas.map((a) => ({
    value: a,
    label: configuredAreaNames.has(a) ? a : `${a} (no DC set)`,
  }))

  // Cart breakdown by shipping category (for display)
  const categoryBreakdown = items.reduce<Record<string, number>>((acc, item) => {
    const cat = getEffectiveShippingCategory(
      item.product?.shipping_category,
      item.product?.category?.default_shipping_category
    )
    acc[cat] = (acc[cat] ?? 0) + item.quantity
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} item{totalItems !== 1 ? 's' : ''} in your order
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Shipping Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        <User className="h-4 w-4 inline mr-1" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        {...register('name')}
                        error={errors.name?.message}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        placeholder="03XX-XXXXXXX"
                        {...register('phone')}
                        error={errors.phone?.message}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      id="city"
                      placeholder="Select your city"
                      options={cityOptions}
                      {...register('city')}
                      error={errors.city?.message}
                    />
                  </div>

                  {/* Area */}
                  {selectedCity && (
                    <div className="space-y-2">
                      <Label htmlFor="area">Area *</Label>
                      <Select
                        id="area"
                        placeholder="Select your area"
                        options={areaOptions}
                        {...register('area')}
                        error={errors.area?.message}
                      />
                      {selectedArea && deliveryCharge > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Delivery charge:{' '}
                          <span className="font-semibold text-foreground">
                            {formatCurrency(deliveryCharge)}
                          </span>
                          {' '}(based on your cart items)
                        </p>
                      )}
                      {selectedArea && deliveryCharge === 0 && configuredAreaNames.has(selectedArea) && (
                        <p className="text-xs text-green-600 font-medium">Free delivery to this area!</p>
                      )}
                      {selectedArea && !configuredAreaNames.has(selectedArea) && (
                        <p className="text-xs text-amber-600">
                          No delivery charge configured for this area yet. Contact us for details.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="House/Flat number, Street, Landmark..."
                      rows={3}
                      {...register('address')}
                      error={errors.address?.message}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      <FileText className="h-4 w-4 inline mr-1" />
                      Order Notes (Optional)
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special instructions..."
                      rows={2}
                      {...register('notes')}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Categories in Cart */}
              {Object.keys(categoryBreakdown).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Package className="h-4 w-4 text-primary" />
                      Shipping Categories in Your Cart
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(Object.entries(categoryBreakdown) as [ShippingCategory, number][]).map(
                        ([cat, qty]) => (
                          <div
                            key={cat}
                            className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                          >
                            <Badge
                              variant="secondary"
                              className={
                                cat === 'bulky_cargo'
                                  ? 'bg-orange-100 text-orange-700'
                                  : cat === 'medium_parcel'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-green-100 text-green-700'
                              }
                            >
                              {SHIPPING_CATEGORY_LABELS[cat]}
                            </Badge>
                            <span className="text-muted-foreground">
                              × {qty} item{qty !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Delivery charge is auto-calculated based on your cart&apos;s shipping categories and quantities.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.product_id} className="flex gap-3">
                          {item.product?.images?.[0] && (
                            <div className="h-14 w-14 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.product?.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            <p className="text-sm font-semibold text-primary">
                              {formatCurrency(
                                getEffectivePrice(
                                  item.product?.price ?? 0,
                                  item.product?.discount_price ?? null
                                ) * item.quantity
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(cartSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span>
                          {!selectedCity ? (
                            <span className="text-muted-foreground">Select city</span>
                          ) : !selectedArea ? (
                            <span className="text-muted-foreground">Select area</span>
                          ) : deliveryCharge === 0 ? (
                            <span className="text-green-600 font-medium">Free</span>
                          ) : (
                            formatCurrency(deliveryCharge)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-base font-bold border-t pt-2">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      isLoading={isPlacingOrder}
                      disabled={isPlacingOrder || !selectedCity || !selectedArea}
                    >
                      {isPlacingOrder
                        ? 'Placing Order...'
                        : `Place Order — ${formatCurrency(total)}`}
                    </Button>

                    {(!selectedCity || !selectedArea) && (
                      <p className="text-xs text-center text-amber-600">
                        Please select a city and area to continue
                      </p>
                    )}

                    <p className="text-xs text-center text-muted-foreground">
                      By placing your order, you agree to our{' '}
                      <Link href="/privacy-policy" className="underline hover:text-foreground">
                        Privacy Policy
                      </Link>
                    </p>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure & Safe Checkout
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
