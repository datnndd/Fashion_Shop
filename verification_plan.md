# Verification Plan: Currency Conversion to VND

## Objective
Verify that all price displays across the application have been correctly converted from USD to Vietnamese Dong (VND), formatted with the Vietnamese locale and "đ" symbol.

## Verified Pages & Components

### 1. Customer Facing Pages
- **HomePage**:
  - [x] Verified "Trending in the Spectrum" section displays prices in VND (e.g., "3.125.000 đ").
- **ProductDetailPage**:
  - [x] Verified main product price is in VND.
  - [x] Verified "Free shipping on orders over..." text uses VND (e.g., "3.750.000 đ").
- **CartPage**:
  - [x] Verified individual item prices are in VND.
  - [x] Verified item total (price * quantity) is in VND.
  - [x] Verified Subtotal and Total in summary are in VND.
  - [x] Verified "Tax" is in VND.
  - [x] Verified "Recommended" items prices are in VND.
- **CollectionsPage**:
  - [x] Verified product grid prices are in VND.
  - [x] Verified original prices (strikethrough) are in VND.
- **CheckoutPage**:
  - [x] Verified shipping method costs are in VND.
  - [x] Verified order summary items and totals are in VND.
- **OrderConfirmationPage**:
  - [x] Verified order items prices are in VND.
  - [x] Verified subtotal, shipping, tax, and total are in VND.
- **AccountPage**:
  - [x] Verified "Recommended for You" prices are in VND.

### 2. Admin Pages
- **AdminProducts**:
  - [x] Verified product list table displays "Base Price" in VND.
- **AdminOrders**:
  - [x] Verified orders list table displays "Total" in VND.
  - [x] Verified order detail modal displays item prices and totals in VND.
- **AdminDashboard**:
  - [x] Verified "Total Revenue" stat is in VND.
  - [x] Verified "Recent Orders" table displays totals in VND.
  - [x] Verified "Top Products" list displays prices in VND.

## Implementation Details
- Created a utility function `formatPriceVND` in `src/utils/currency.js`.
- Hardcoded exchange rate: 1 USD = 25,000 VND.
- Rounding: `Math.floor` is used to avoid decimal values in VND.
- applied `formatPriceVND` to all identified price occurrences.

## Automated Verification
- Ran a browser automation script to navigate through the main user flows and capture screenshots.
- Confirmed visually via screenshots that prices are formatted correctly.
