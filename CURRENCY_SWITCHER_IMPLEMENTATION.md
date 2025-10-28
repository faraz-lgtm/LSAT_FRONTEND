# Currency Switcher Implementation

## Overview
A currency switcher has been added to the application, allowing users to switch between different currencies (CAD, USD, EUR, GBP) throughout both the user-facing pages and the dashboard.


### 2. `src/components/dashboard/currency-switch.tsx`
- Dashboard UI component for currency switching
- Similar to `ThemeSwitch` component
- Dropdown menu with currency options and check marks

### 3. `src/components/currency-switch.tsx`
- User-facing UI component for currency switching
- Similar to the dashboard component but styled for the user-facing header
- Dropdown menu with currency options and check marks

## Files Modified

### 1. `src/utils/currency.ts`
- **Kept backward compatible**: Original `formatCurrency()` function still works
- **Added**: `formatCurrencyWithSymbol()` function that accepts a currency parameter
- **Added**: `useCurrencyFormatter()` hook that automatically uses the current currency from context
- Updated `parseCurrencyToCents()` to handle multiple currency symbols (€, £, etc.)

### 2. `src/main.tsx`
- Added `CurrencyProvider` to the app provider stack
- Wrapped around `FontProvider` to provide currency context to all components

### 3. Dashboard Page Headers
Added `CurrencySwitch` component to headers in:
- `src/features/dashboardRelated/users/index.tsx`
- `src/features/dashboardRelated/dashboard/index.tsx`
- `src/features/dashboardRelated/orders/index.tsx`
- `src/features/dashboardRelated/invoices/index.tsx`
- `src/features/dashboardRelated/transactions/index.tsx`
- `src/features/dashboardRelated/refunds/index.tsx`

### 4. User-Facing Pages
Added currency switcher and updated all price displays:
- `src/Layouts/DefaultLayout.tsx` - Added currency switcher to header
- `src/components/ProductCard.tsx` - Updated price displays
- `src/Pages/Cart/Cart.tsx` - Updated cart total display
- `src/Pages/Cart/CartCard.tsx` - Updated price display
- `src/Pages/Cart/OrderSummary.tsx` - Updated subtotal, tax, and total displays
- `src/Pages/Appointment/index.tsx` - Updated session price and total amount displays

### 5. Example Integration
- `src/features/dashboardRelated/transactions/components/transactions-table.tsx` 
  - Updated to use `useCurrencyFormatter()` hook
  - Shows how to integrate currency context into table components

## How to Use

### For New Components (Recommended)
```typescript
import { useCurrencyFormatter } from '@/utils/currency'

function MyComponent() {
  const formatCurrency = useCurrencyFormatter()
  
  return <div>{formatCurrency(centsAmount)}</div>
}
```

### For Existing Components
You can gradually migrate existing components to use the currency switcher:

**Before:**
```typescript
import { formatCurrency } from '@/utils/currency'

cell: ({ row }) => {
  const amount = row.getValue('amount') as number
  return <div>{formatCurrency(amount)}</div>
}
```

**After:**
```typescript
import { useCurrencyFormatter } from '@/utils/currency'

export function MyTable() {
  const formatCurrency = useCurrencyFormatter()
  
  // ... in column definition:
  cell: ({ row }) => {
    const amount = row.getValue('amount') as number
    return <div>{formatCurrency(amount)}</div>
  }
}
```

## Backward Compatibility
- The original `formatCurrency()` function still works and defaults to USD ($)
- Existing code continues to function without changes
- Migration to currency-aware formatting is optional and can be done gradually

## How to Revert

To revert this implementation:

1. **Remove the provider from `src/main.tsx`:**
   - Remove `CurrencyProvider` import and wrapper

2. **Remove currency switcher from headers:**
   - Delete `CurrencySwitch` import from dashboard pages
   - Remove `<CurrencySwitch />` component from JSX

3. **Optionally revert changes to `src/utils/currency.ts`:**
   - Remove the import of `useCurrency` 
   - Remove `formatCurrencyWithSymbol()` function
   - Remove `useCurrencyFormatter()` hook
   - Revert `parseCurrencyToCents()` to original regex

4. **Delete the new files:**
   - Delete `src/context/currency-provider.tsx`
   - Delete `src/components/dashboard/currency-switch.tsx`

## Current Implementation Status

### Dashboard Pages
✅ Currency switcher UI added to all dashboard pages
✅ Currency context provider integrated
✅ Hook-based formatter available
✅ Example integration in transactions table
⚠️ Other tables still use original `formatCurrency()` function

### User-Facing Pages
✅ Currency switcher UI added to header layout
✅ All price displays updated to use currency formatter
✅ ProductCard component updated
✅ Cart page updated
✅ CartCard component updated
✅ OrderSummary component updated
✅ Appointment page updated

## Next Steps

To complete the integration, update the following components to use `useCurrencyFormatter()`:

- [ ] `src/features/dashboardRelated/invoices/components/invoices-table.tsx`
- [ ] `src/features/dashboardRelated/orders/components/orders-view-dialog.tsx`
- [ ] `src/features/dashboardRelated/refunds/components/refunds-table.tsx`
- [ ] `src/features/dashboardRelated/dashboard/index.tsx`
- [ ] Any other components that display currency amounts

## Currency Symbols and Exchange Rates

All amounts in the database are stored in **CAD cents**. The switcher converts values using exchange rates fetched from your backend API.

### Backend API
- **Endpoint**: `GET /currency/exchange-rates?baseCurrency=CAD`
- **Purpose**: Provides live exchange rates relative to CAD
- **Implementation**: Fetch rates from external API (e.g., Stripe, exchangerate-api.io) on your backend

### Supported Currencies
- **CAD**: CA$ - Base currency (rate: 1.0)
- **USD**: $ - US Dollar
- **EUR**: € - Euro
- **GBP**: £ - British Pound

**Example**: If you have 125 CAD cents (CA$1.25), switching to USD will show the converted value based on current exchange rates from your backend.

**Note for User-Facing Pages**: Prices from the backend are in CAD dollars, but the currency formatter expects cents. To convert: multiply the dollar amount by 100 before passing to `formatCurrency()`. For example: `formatCurrency(product.price * 100)`.

### Fallback Behavior
If the backend API is unavailable, the app uses fallback rates:
- USD: 0.74 (1 CAD = 0.74 USD)
- EUR: 0.68 (1 CAD = 0.68 EUR)
- GBP: 0.58 (1 CAD = 0.58 GBP)

