export interface Statistics {
  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  products: {
    total: number;
    inStock: number;
    outOfStock: number;
    lowStock: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  categories: {
    total: number;
  };
}

export interface ProductStatistics {
  topProducts: Array<{
    productId: string;
    productName: string;
    salesCount: number;
    revenue: number;
  }>;
  lowStock: Array<{
    productId: string;
    productName: string;
    stockQuantity: number;
    inStock: boolean;
  }>;
  outOfStock: Array<{
    productId: string;
    productName: string;
    stockQuantity: number;
    inStock: boolean;
  }>;
}

