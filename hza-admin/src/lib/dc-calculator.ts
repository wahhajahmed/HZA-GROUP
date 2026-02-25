// =============================================
// Delivery Charge Calculator
// Handles scaling rules for all shipping categories
// and mixed-cart DC computation
// =============================================

export type ShippingCategory = 'small_parcel' | 'medium_parcel' | 'bulky_cargo';

export interface CategoryQty {
  category: ShippingCategory;
  quantity: number;
}

export interface AreaCharges {
  small_parcel_charge: number;
  medium_parcel_charge: number;
  bulky_cargo_charge: number;
}

/**
 * Scaling factor for a given shipping category and quantity.
 *  - small_parcel : always 1.0 (fixed, never scales)
 *  - medium_parcel: 1 + (qty - 1) * 0.5  → 1→1.0x, 2→1.5x, 3→2.0x …
 *  - bulky_cargo  : 1 + (qty - 1) * 0.5  → same formula
 */
export function getScalingFactor(category: ShippingCategory, quantity: number): number {
  if (category === 'small_parcel') return 1;
  return 1 + (Math.max(1, quantity) - 1) * 0.5;
}

/**
 * Numeric priority for ranking categories highest → lowest.
 *  bulky_cargo = 3, medium_parcel = 2, small_parcel = 1
 */
function categoryPriority(cat: ShippingCategory): number {
  if (cat === 'bulky_cargo') return 3;
  if (cat === 'medium_parcel') return 2;
  return 1;
}

/**
 * Main DC calculation.
 *
 * Rules:
 *  1. Group cart items by shipping_category, summing quantities.
 *  2. If any Medium or Bulky items exist, drop all Small items.
 *  3. Take the top 2 highest-priority categories remaining.
 *  4. For each, DC = base_charge × scalingFactor(qty)
 *  5. Total DC = sum of those two (or one if only one category).
 *
 * @param cartItems   Array of { category, quantity } for each line item
 * @param areaCharges Base charges per category for the selected area
 * @returns           Calculated delivery charge (rounded to 2 dp)
 */
export function calculateDeliveryCharge(
  cartItems: Array<{ shipping_category?: ShippingCategory | null; quantity: number }>,
  areaCharges: AreaCharges
): number {
  if (cartItems.length === 0) return 0;

  // Step 1: aggregate quantities per category
  const totals: Partial<Record<ShippingCategory, number>> = {};
  for (const item of cartItems) {
    const cat = item.shipping_category ?? 'small_parcel';
    totals[cat] = (totals[cat] ?? 0) + item.quantity;
  }

  // Step 2: if medium or bulky present → remove small
  const hasHighPriority =
    (totals['medium_parcel'] ?? 0) > 0 || (totals['bulky_cargo'] ?? 0) > 0;
  if (hasHighPriority) {
    delete totals['small_parcel'];
  }

  // Step 3: build array sorted by priority desc, take top 2
  const sorted = (Object.keys(totals) as ShippingCategory[]).sort(
    (a, b) => categoryPriority(b) - categoryPriority(a)
  );
  const top2 = sorted.slice(0, 2);

  // Step 4 & 5: sum scaled DC for each
  let total = 0;
  for (const cat of top2) {
    const qty = totals[cat]!;
    const baseCharge =
      cat === 'small_parcel'
        ? areaCharges.small_parcel_charge
        : cat === 'medium_parcel'
          ? areaCharges.medium_parcel_charge
          : areaCharges.bulky_cargo_charge;
    total += baseCharge * getScalingFactor(cat, qty);
  }

  return Math.round(total * 100) / 100;
}

/** Human-readable label for a shipping category */
export const SHIPPING_CATEGORY_LABELS: Record<ShippingCategory, string> = {
  small_parcel: 'Small Parcel',
  medium_parcel: 'Medium Parcel',
  bulky_cargo: 'Bulky Cargo',
};

/**
 * Returns the effective shipping category for a product.
 *
 * Priority:
 *  1. If product has been explicitly set to medium_parcel or bulky_cargo → use it.
 *  2. Otherwise (product is small_parcel / null / default) → use the category's
 *     default_shipping_category if one is set (covers products created before
 *     the shipping-category feature was added).
 *  3. Final fallback → 'small_parcel'
 */
export function getEffectiveShippingCategory(
  productShippingCategory: ShippingCategory | null | undefined,
  categoryDefaultShippingCategory: ShippingCategory | null | undefined
): ShippingCategory {
  // Product explicitly set to medium / bulky → honour it
  if (productShippingCategory && productShippingCategory !== 'small_parcel') {
    return productShippingCategory;
  }
  // Use category default if available (handles legacy / un-set products)
  return categoryDefaultShippingCategory ?? productShippingCategory ?? 'small_parcel';
}

/** Description hint shown to admins/users */
export const SHIPPING_CATEGORY_HINTS: Record<ShippingCategory, string> = {
  small_parcel: 'Clothes, sleepers, small accessories',
  medium_parcel: 'Electronics, home appliances',
  bulky_cargo: 'Chairs, large furniture, heavy items',
};

export const SHIPPING_CATEGORY_OPTIONS = (
  Object.keys(SHIPPING_CATEGORY_LABELS) as ShippingCategory[]
).map((value) => ({
  value,
  label: SHIPPING_CATEGORY_LABELS[value],
  hint: SHIPPING_CATEGORY_HINTS[value],
}));
