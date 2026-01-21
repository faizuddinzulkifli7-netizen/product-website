# Admin Panel - Internal Management System

A secure, role-based internal interface for administrators and managers to operate the business.

## Features

### 🔐 Authentication & Authorization
- Secure login system
- Role-based access control (Admin/Manager)
- Session management

### 📊 Dashboard
- Key metrics: Total Sales, Orders, Pending Orders, Active Products
- Sales by month visualization
- Orders by status breakdown
- Recent orders overview

### 📦 Product Management
- Create, update, and delete products
- Activate/deactivate products
- Control product visibility on frontend
- Manage pricing and stock levels
- Extended product information (specifications, usage, storage, warnings)

### 🛒 Order Management
- View all orders with filtering
- Update order status (pending, processing, shipped, delivered, cancelled)
- Monitor payment statuses from B2BINPAY
- Handle order fulfillment
- View detailed order information

### 👥 User Management
- Create and manage admin users
- Assign roles (Admin/Manager)
- Activate/deactivate users
- View user activity

### ⭐ Review Moderation
- View all customer reviews
- Approve/reject/pending review status
- Delete reviews
- Filter by status

### 📝 Activity Logs
- Track all administrative actions
- Filter by entity type (product, order, user, review, system)
- View detailed action history with timestamps

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The admin panel will be available at `http://localhost:3000`

### Login Credentials

**Demo Account:**
- Email: `admin@example.com`
- Password: Any password (for demo purposes)

## Project Structure

```
admin-panel/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── login/        # Login page
│   │   ├── products/     # Product management
│   │   ├── orders/       # Order management
│   │   ├── users/        # User management
│   │   ├── reviews/      # Review moderation
│   │   └── logs/         # Activity logs
│   ├── components/       # React components
│   │   └── layout/       # Layout components
│   ├── contexts/         # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/              # Utilities and APIs
│   │   └── mockApi.ts    # Mock API implementation
│   └── types/            # TypeScript types
│       └── index.ts
```

## Mock API

Currently, the admin panel uses a mock API (`src/lib/mockApi.ts`) that simulates backend functionality. This includes:

- In-memory data storage
- Simulated network delays
- Activity logging
- All CRUD operations

When the backend is ready, replace the mock API calls with actual API endpoints.

## Security Features

- Authentication required for all pages
- Role-based access control
- Activity logging for accountability
- Secure session management

## Technologies

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Context** - State management

## Notes

- All data is stored in memory and will reset on page refresh
- The mock API simulates network delays for realistic behavior
- Activity logs are automatically generated for all administrative actions
