export interface OrderItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    images: string[];
  };
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: number;
  user: {
    id: number;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  status: OrderStatus;
  deliveryStreet: string;
  deliveryCity: string;
  deliveryPostalCode: string;
  deliveryCountry: string;
  paymentMethod: string;
  comment: string | null;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  limit: number;
  offset: number;
}

