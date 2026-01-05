export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  images: string[];
  categoryId: string;
  category?: {
    id: string;
    name: string;
    image: string;
    slug: string;
    parentId: string | null;
  };
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  sizes: string[] | null;
  colors: string[] | null;
  brand: string | null;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  minRating?: number;
  inStock?: boolean;
  sortBy?: 'price' | 'rating' | 'name' | 'reviewCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  limit: number;
  offset: number;
}

