

## Plan: 6 Updates to Product Pages, Footer, and Home

### 1. Update variation prices/sizes in `productData.ts`
Replace the current generic detox plan variations with realistic juice size variations:
- **300ml** — ₹79 (single serve)
- **500ml** — ₹129 (regular)
- **1L** — ₹229 (family, badge: "Best Value")

Update `createVariations` helper and the `detoxPlans` array accordingly.

### 2. Sticky footer in `Footer.tsx`
Add `fixed bottom-0 left-0 right-0 z-40` classes to the footer element. Add matching `pb-[footer-height]` padding to page wrappers in `Index.tsx`, `Products.tsx`, `ProductDetail.tsx`, `About.tsx`, `Contact.tsx`, `Cart.tsx` (and admin pages) so content isn't hidden behind it.

### 3. Products page layout reorganization (`Products.tsx`)
Restructure the header area into a 3-column flex layout:
- **Left**: "Our Juices" title + subtitle
- **Center**: Category filter buttons (wrapped, centered)
- **Right**: Sort dropdown (right-aligned)

### 4. Replace CategoriesSection with Detox Plans CTA (`CategoriesSection.tsx`)
Remove the current category grid. Replace with 3 visually rich CTA cards:
- **Urban Reset** — 1 Day Detox / Quick Body Reset
- **Urban Cleanse** — 7 Day Program / Deep Internal Clean (badge: "Most Popular")
- **Urban Transformation** — 28 Day Program / Full Lifestyle Upgrade (badge: "Best Value")

Each card will use a gradient/illustration background (CSS-generated, no external images needed), with a CTA button linking to the products page filtered appropriately.

### 5. Add Cucumber category + alphabetical order (`Products.tsx`)
Update the `categories` array to include "Cucumber" and sort alphabetically:
```
["All", "Ash Gourd", "Beetroot", "Carrot", "Cucumber", "Mix Veg", "Tomato", "Wheatgrass"]
```

### 6. Product Detail — move back arrow inline, remove spacing (`ProductDetail.tsx`)
Remove the standalone "Back to Products" button block. Instead, place a small back arrow icon button at the top-left of the `<main>` with minimal margin (`mb-2` instead of `mb-6`), so the image and product info sit closer to the top of the viewport. The arrow will be just the icon, no text label.

### Files to modify
| File | Changes |
|---|---|
| `src/lib/productData.ts` | Update detoxPlans to 300ml/500ml/1L with real prices |
| `src/components/Footer.tsx` | Add fixed positioning classes |
| `src/pages/Products.tsx` | 3-column header layout, add Cucumber, alphabetical categories |
| `src/components/CategoriesSection.tsx` | Replace with 3 Detox Plan CTAs |
| `src/pages/ProductDetail.tsx` | Compact back arrow, remove extra spacing |
| `src/pages/Index.tsx`, `About.tsx`, `Contact.tsx`, `Cart.tsx`, `AdminDashboard.tsx`, `AdminLogin.tsx`, `AdminSettings.tsx` | Add bottom padding for fixed footer |

