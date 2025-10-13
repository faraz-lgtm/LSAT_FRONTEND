// export interface WooCommerceOrder {
//   payment_method: string; // e.g., "bacs", "cheque", "cod", "paypal"
//   payment_method_title?: string; // e.g., "Direct Bank Transfer"
//   set_paid?: boolean; // true if already paid

//   billing: WooCommerceAddress; // required billing details
//   shipping?: WooCommerceAddress; // optional shipping details

//   line_items: WooCommerceLineItem[]; // products added to order
//   shipping_lines?: WooCommerceShippingLine[]; // shipping methods

//   customer_id?: number; // WP user ID (optional if guest)
//   customer_note?: string; // any note attached
//   transaction_id?: string; // for payment gateway tracking
//   coupon_lines?: WooCommerceCouponLine[]; // applied coupons
//   fee_lines?: WooCommerceFeeLine[]; // custom fees
//   meta_data?: WooCommerceMetaData[]; // custom metadata
// }

export interface StripeOrderResponse {
  url:string;
  sessionId:string;
}

// export interface WooCommerceResponseLineItem {
//   id: number;
//   name: string;
//   product_id: number;
//   variation_id: number;
//   quantity: number;
//   tax_class: string;
//   subtotal: string;
//   subtotal_tax: string;
//   total: string;
//   total_tax: string;
//   taxes: WooCommerceTax[];
//   meta_data: WooCommerceResponseMetaData[];
//   sku: string;
//   price: number;
// }

// export interface WooCommerceResponseShippingLine {
//   id: number;
//   method_title: string;
//   method_id: string;
//   total: string;
//   total_tax: string;
//   taxes: WooCommerceTax[];
//   meta_data: WooCommerceResponseMetaData[];
// }

// export interface WooCommerceTaxLine {
//   id: number;
//   rate_code: string;
//   rate_id: number;
//   label: string;
//   compound: boolean;
//   tax_total: string;
//   shipping_tax_total: string;
//   meta_data: WooCommerceResponseMetaData[];
// }

// export interface WooCommerceResponseMetaData {
//   id: number;
//   key: string;
//   value: any;
// }

// export interface WooCommerceTax {
//   id: number;
//   total: string;
//   subtotal: string;
// }

// export interface WooCommerceRefund {
//   id: number;
//   reason?: string;
//   total: string;
// }

// export interface WooCommerceLinks {
//   self: { href: string }[];
//   collection: { href: string }[];
// }

// Reusable sub-types

// export interface WooCommerceAddress {
//   first_name: string;
//   last_name: string;
//   company?: string;
//   address_1: string;
//   address_2?: string;
//   city: string;
//   state: string;
//   postcode: string;
//   country: string;
//   email?: string;
//   phone?: string;
// }

// export interface WooCommerceLineItem {
//   product_id: number; // WooCommerce product ID
//   variation_id?: number;
//   quantity: number;
//   total?: string; // optional, WooCommerce can calculate
//   subtotal?: string;
//   meta_data?: WooCommerceMetaData[];
// }

// export interface WooCommerceShippingLine {
//   method_id: string; // e.g., "flat_rate"
//   method_title: string; // e.g., "Flat Rate"
//   total: string; // shipping cost
// }

// export interface WooCommerceCouponLine {
//   code: string; // coupon code
//   discount?: string;
//   discount_tax?: string;
// }

// export interface WooCommerceFeeLine {
//   name: string; // fee name
//   total: string;
//   tax_class?: string;
//   tax_status?: string;
// }

// export interface WooCommerceMetaData {
//   key: string;
//   value: any;
// }
