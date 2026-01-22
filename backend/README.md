# Product Website Backend

Backend API for the product website, built with NestJS.

## Features

- **Authentication**: JWT-based authentication for customers and admin users
- **Products Management**: CRUD operations for products with stock management
- **Shopping Cart**: Cart management for authenticated users and guests
- **Orders**: Order creation, status management, and payment integration
- **Reviews**: Product review system with moderation
- **Admin Panel**: Dashboard metrics, activity logs, and admin operations
- **Payment Integration**: B2BINPAY On-Ramp payment gateway integration
- **Webhooks**: Payment webhook handling for payment verification
- **Security**: Rate limiting, CORS, input validation, JWT authentication

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the following variables:
- `JWT_SECRET`: Secret key for JWT tokens
- `DATABASE_PATH`: Path to SQLite database file
- `FRONTEND_URL`: Frontend application URL
- `ADMIN_PANEL_URL`: Admin panel URL
- `B2BINPAY_*`: B2BINPAY API credentials

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Customer sign up
- `POST /api/auth/signin` - Customer sign in
- `GET /api/auth/me` - Get current user
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get current admin

### Products
- `GET /api/products` - Get all products
- `GET /api/products/visible` - Get visible products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PATCH /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get cart
- `POST /api/cart/add` - Add item to cart
- `PATCH /api/cart/items/:productId` - Update cart item
- `DELETE /api/cart/items/:productId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders/checkout` - Create order and initiate payment
- `GET /api/orders` - Get orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status (Admin)
- `PATCH /api/orders/:id/payment-status` - Update payment status (Admin)

### Reviews
- `GET /api/reviews` - Get approved reviews
- `GET /api/reviews?productId=:id` - Get reviews for product
- `POST /api/reviews` - Create review
- `GET /api/reviews/admin` - Get all reviews (Admin)
- `PATCH /api/reviews/:id/status` - Update review status (Admin)
- `DELETE /api/reviews/:id` - Delete review (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard metrics
- `GET /api/admin/logs` - Get activity logs

### Webhooks
- `POST /api/webhooks/b2binpay` - B2BINPAY payment webhook

## Order States

- `created` - Order created, awaiting payment
- `pending` - Payment received, order pending
- `processing` - Order being processed
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

## Payment States

- `pending` - Payment pending
- `paid` - Payment completed
- `failed` - Payment failed
- `refunded` - Payment refunded

## Security

- JWT authentication for protected routes
- Role-based access control (Admin/Manager/Customer)
- Rate limiting (100 requests per minute)
- Input validation with class-validator
- CORS enabled for frontend and admin panel
- Password hashing with bcrypt

## Database

The application uses SQLite by default (can be changed to PostgreSQL/MySQL in TypeORM configuration).

Database schema is automatically synchronized in development mode.

## License

Private
