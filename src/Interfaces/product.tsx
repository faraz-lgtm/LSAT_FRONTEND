export type Product = {
  id: number;
  name: string;
  price: number;
  Duration:string;
  Description:string;
  DateTime?:Date[] | undefined[];
  // add more fields from WooCommerce if needed
};