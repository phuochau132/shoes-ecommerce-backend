import Product, { OptionValue } from '@/models/product.model';
export interface FormattedProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  images: any[];
  reviews: any[];
  variants: { id: number; options: OptionValue[] }[];
}
