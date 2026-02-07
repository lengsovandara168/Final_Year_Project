// Phone Shop System Types

export interface Phone {
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  image?: string;
  description?: string;
  specifications?: {
    storage?: string;
    ram?: string;
    color?: string;
    battery?: string;
    screen?: string;
  };
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt?: string;
}

export interface Order {
  id: number;
  customerId: number;
  customer?: Customer;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'online';
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  phoneId: number;
  phone?: Phone;
  quantity: number;
  price: number;
}
