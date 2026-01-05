export interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
  parentId: string | null;
  productCount?: number;
  products?: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

