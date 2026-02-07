# Phone Shop Management System - Frontend

A modern phone shop management system built with Next.js and shadcn/ui.

## 🚀 Features

### Current Implementation
- **Dashboard**: Overview with key metrics (Revenue, Products, Orders, Customers)
- **Products Management**: View and manage phone inventory
- **Orders Management**: Track and manage customer orders
- **Customers Management**: Customer database and history
- **Responsive UI**: Built with shadcn/ui components
- **Modern Design**: Clean, professional interface with Tailwind CSS

### Pages Structure
```
app/
├── page.tsx                    # Dashboard (Home)
├── (dashboard)/
│   ├── layout.tsx             # Dashboard layout with sidebar & header
│   ├── products/
│   │   └── page.tsx           # Products list
│   ├── orders/
│   │   └── page.tsx           # Orders list
│   └── customers/
│       └── page.tsx           # Customers list
```

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Backend**: Laravel API (in `/backend`)

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎨 UI Components Used

- Button
- Card
- Input
- Select
- Badge
- Dialog
- Table
- Dropdown Menu
- Avatar

## 📊 Data Types

### Phone
```typescript
{
  id: number;
  name: string;
  brand: string;
  model: string;
  price: number;
  stock: number;
  specifications?: {
    storage, ram, color, battery, screen
  };
}
```

### Order
```typescript
{
  id: number;
  customerId: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod?: 'cash' | 'card' | 'online';
}
```

### Customer
```typescript
{
  id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
}
```

## 🔄 Next Steps

### To Connect with Laravel Backend:

1. **Create API service layer**:
```typescript
// lib/api/index.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function fetchProducts() {
  const response = await fetch(`${API_URL}/products`);
  return response.json();
}
```

2. **Add environment variables** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. **Replace mock data** with API calls:
```typescript
// In products/page.tsx
const products = await fetchProducts();
```

4. **Add authentication**:
- Login/Register pages
- Token storage (localStorage/cookies)
- Protected routes with middleware

5. **Additional features to implement**:
- Add/Edit/Delete products
- Order creation and management
- Customer CRUD operations
- Search and filtering
- Pagination
- Image uploads
- Reports and analytics

## 📁 Project Structure

```
frontend/
├── app/
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── layout.tsx        # Shared layout
│   │   ├── products/
│   │   ├── orders/
│   │   └── customers/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Home/Dashboard
├── components/
│   ├── ui/                   # shadcn components
│   └── layout/
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── utils.ts              # Utility functions
└── public/
```

## 🎯 Current Status

✅ UI Components installed and configured  
✅ Dashboard layout with sidebar and header  
✅ Products page with table  
✅ Orders page with status filtering  
✅ Customers page with avatars  
✅ TypeScript types defined  
⏳ API integration (pending)  
⏳ Authentication (pending)  
⏳ CRUD operations (pending)  

## 🔗 Backend Integration

The backend Laravel API is in `/backend`. To run both:

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Backend
cd backend
php artisan serve
```

Configure CORS in Laravel to allow frontend requests.
