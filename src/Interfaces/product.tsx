export type Product = {
  id: number;
  name: string;
  price: number;
  save: number;
  Duration:string;
  Description:string;
  badge?: {
    text: string;
    color: string;
  };
  DateTime?:Date[] | undefined[];
  // add more fields from WooCommerce if needed
};