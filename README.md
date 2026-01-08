# E-Commerce Backend

A full-featured e-commerce backend built with Node.js, TypeScript, Prisma, PostgreSQL, and Stripe payment integration.

## Features

- ✅ **User Authentication** - JWT-based authentication with role-based access (Admin/User)
- ✅ **Product Management** - Full CRUD operations for products (Admin only for create/update/delete)
- ✅ **Shopping Cart** - Add, update, remove items from cart
- ✅ **Order Management** - Create orders from cart, track order status
- ✅ **Payment Integration** - Stripe payment processing
- ✅ **Role-Based Access Control** - Admin and User roles with appropriate permissions

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Payment**: Stripe
- **Password Hashing**: bcryptjs

## Project Structure

```
src/
├── controllers/          # Route handlers (controllers)
│   ├── auth/
│   │   └── index.ts      # Authentication routes
│   ├── product/
│   │   └── index.ts      # Product routes
│   ├── cart/
│   │   └── index.ts      # Cart routes
│   ├── order/
│   │   └── index.ts      # Order routes
│   └── payment/
│       └── index.ts      # Payment routes
├── services/             # Business logic layer
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   └── payment.ts
├── routes/               # Main router
│   └── index.ts         # Aggregates all routes
├── middlewares/          # Express middlewares
│   ├── auth.ts          # Authentication & authorization
│   └── errorHandler.ts  # Global error handler
├── utils/                # Utility functions
│   ├── jwt.ts           # JWT token utilities
│   └── password.ts       # Password hashing utilities
├── config/               # Configuration files
│   └── prisma.ts        # Prisma client instance
├── prisma/               # Prisma schema
│   └── schema.prisma
└── bin/
    └── www              # Server entry point
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
PORT=3000
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run generate

# Run migrations
npm run migrate
```

### 4. Build Project

```bash
npm run build
```

This will:
- Run Prisma migrations
- Generate Prisma Client
- Compile TypeScript to JavaScript in `dist/` folder

### 5. Run Development Server

```bash
npm run dev
```

Or for production:

```bash
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/admin-only` - Admin only endpoint (requires admin role)

### Products (`/api/products`)

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart (`/api/cart`)

- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart/items` - Add item to cart (requires auth)
- `PUT /api/cart/items/:id` - Update cart item quantity (requires auth)
- `DELETE /api/cart/items/:id` - Remove item from cart (requires auth)
- `DELETE /api/cart` - Clear cart (requires auth)

### Orders (`/api/orders`)

- `GET /api/orders` - Get all orders (user sees own, admin sees all)
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create order from cart (requires auth)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

### Payments (`/api/payments`)

- `POST /api/payments/create-intent` - Create Stripe payment intent (requires auth)
- `POST /api/payments/confirm` - Confirm payment (requires auth)
- `GET /api/payments/status/:orderId` - Get payment status (requires auth)

## Database Schema

- **User** - User accounts with roles (USER/ADMIN)
- **Product** - Product catalog
- **Cart** - User shopping carts
- **CartItem** - Items in cart
- **Order** - Customer orders
- **OrderItem** - Items in orders
- **Payment** - Payment records linked to orders

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Notes

- After `npm run build`, compiled JavaScript files are saved in the `dist/` folder
- Each controller module has an `index.ts` file that exports the router
- All routes are aggregated in `src/routes/index.ts`
- Services contain business logic, controllers handle HTTP requests/responses
- Middlewares handle authentication, authorization, and error handling

## License

ISC
