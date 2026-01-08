# E-Commerce Full-Stack Application

A complete e-commerce application with Node.js + TypeScript backend and Streamlit frontend.

## Project Structure

```
.
├── backend/              # Backend API (Node.js + TypeScript + Prisma)
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middlewares/  # Express middlewares
│   │   ├── utils/        # Utility functions
│   │   ├── config/       # Configuration
│   │   └── prisma/       # Prisma schema
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # Frontend (Streamlit)
│   ├── app.py           # Main Streamlit application
│   ├── requirements.txt
│   └── README.md
├── package.json         # Root package.json (for convenience scripts)
└── README.md           # This file
```

## Features

### Backend
- ✅ User Authentication (JWT)
- ✅ Product CRUD (Admin only for create/update/delete)
- ✅ Shopping Cart
- ✅ Order Management
- ✅ Stripe Payment Integration
- ✅ Role-Based Access Control (Admin/User)

### Frontend
- ✅ User Authentication (Login/Register)
- ✅ Product Browsing
- ✅ Shopping Cart Management
- ✅ Order History
- ✅ Checkout Process

## Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in `backend/` directory (copy from `backend/.env.example`):
```bash
cd backend
cp .env.example .env
# Then edit .env with your actual values
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
PORT=3000
```

4. Setup database:
```bash
npm run generate
npm run migrate
```

5. Run backend:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run Streamlit app:
```bash
streamlit run app.py
```

Frontend will run on `http://localhost:8501`

## Root Level Scripts

From the root directory, you can use:

```bash
# Run backend in dev mode
npm run dev

# Run frontend
npm run frontend

# Build backend
npm run build
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Products (`/api/products`)
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Cart (`/api/cart`)
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart/items` - Add item to cart (requires auth)
- `PUT /api/cart/items/:id` - Update cart item (requires auth)
- `DELETE /api/cart/items/:id` - Remove item (requires auth)
- `DELETE /api/cart` - Clear cart (requires auth)

### Orders (`/api/orders`)
- `GET /api/orders` - Get orders (requires auth)
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `POST /api/orders` - Create order from cart (requires auth)

### Payments (`/api/payments`)
- `POST /api/payments/create-intent` - Create payment intent (requires auth)
- `POST /api/payments/confirm` - Confirm payment (requires auth)
- `GET /api/payments/status/:orderId` - Get payment status (requires auth)

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Stripe Payments

### Frontend
- Streamlit (Python)
- Requests (HTTP client)

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
streamlit run app.py
```

## License

ISC
