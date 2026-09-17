# Fashion & Freedom — Premium Menswear E-Commerce Platform

A complete, full-stack, neumorphic-styled e-commerce web application featuring user authentication, profile customisation, product browsing with category filtering, a shopping cart, a persistent wishlist, and an order management system. Built with modern web technologies: React, Express, MongoDB, and Redis.

---

## Key Features

- **Authentication & Security:** JWT-based user authentication, password hashing via bcrypt, rate-limiting on sensitive authentication endpoints, and CORS protection.
- **Forgot Password Flow:** Secure OTP (One-Time Password) generation, delivery (logged via console/SMTP), verification, and password reset functionality.
- **Social Login Simulation:** Mock Google and Facebook OAuth integration.
- **Interactive Product Catalog:** Dynamic search, categories filtering, and "Featured" product highlight badges.
- **Wishlist Management:** Persistent, database-backed item wishlisting with real-time navbar counter badge.
- **Shopping Cart System:** Persistent shopping cart (local storage), size selectors, quantity controls, and server-side price verification on checkout.
- **Order Tracking:** Checkout flow with shipping address capture, mock credit card/COD payment processing, and expandable order history tracking.
- **Admin Dashboard:** Product inventory controls (add, edit, soft-delete products) and order status update controls.
- **Neumorphic UI System:** Soft, aesthetic raised and inset shadow tokens, micro-interactions, responsive side drawer, and custom toast notifications.

---

## 🛠️ Technology Stack

| Component | Technology | Documentation Reference |
| :--- | :--- | :--- |
| **Frontend Core** | React 19 | [React Official Docs](https://react.dev) |
| **Build Tooling** | Vite | [Vite Guide](https://vite.dev) |
| **Styling** | Vanilla CSS + Tailwind Utility | [Tailwind CSS Docs](https://tailwindcss.com) |
| **Icons Library** | React Icons (FontAwesome) | [React Icons](https://react-icons.github.io/react-icons/) |
| **Backend Framework** | Node.js + Express 5 | [Express.js Docs](https://expressjs.com) |
| **Database** | MongoDB | [MongoDB Manual](https://www.mongodb.com/docs/) |
| **Database ODM** | Mongoose | [Mongoose ODM](https://mongoosejs.com) |
| **Caching Layer** | Redis | [Redis Docs](https://redis.io/documentation) |
| **Notifications** | React Hot Toast | [React Hot Toast Docs](https://react-hot-toast.com) |
| **Avatars** | DiceBear API | [DiceBear Avatars](https://www.dicebear.com) |

---

## 📂 Project Structure

```
E-commerce/
├── backend/                        # Express API Server
│   ├── src/
│   │   ├── index.js                # Server Entry, Security Middleware, Rate Limiters
│   │   ├── seed.js                 # MongoDB Database Seed Script
│   │   ├── controllers/            # Controller Functions (Auth, Orders, Products)
│   │   ├── lib/                    # Library Configs (Redis Client)
│   │   ├── middleware/             # JWT Verification, Global Error Handler
│   │   ├── models/                 # Database Schemas (User, Product, Order)
│   │   └── routes/                 # Express API Router Declarations
│   └── package.json
│
├── frontend/                       # React Frontend Application
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx                 # Routes Configuration, Global Toast Setup
│   │   ├── index.css               # Neumorphic CSS Styling & Design System Tokens
│   │   ├── context/                # Context Providers (AuthContext, CartContext)
│   │   ├── lib/                    # HTTP Client Helper (api.js)
│   │   └── components/             # UI Components (Navbar, Cards, Pages, Checkout)
│   └── package.json
│
└── README.md                       # Documentation File
```

---

## ⚙️ Environment Configuration

### Backend Environment (`backend/.env`)
Create a `.env` file inside the `backend` directory:
```env
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_generated_jwt_secret_token
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
# Optional Redis URL (defaults to db-only if left commented out)
# REDIS_URL=redis://127.0.0.1:6379
```

### Frontend Environment (`frontend/.env`)
Create a `.env` file inside the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Getting Started

### Prerequisites
- Node.js (v18.0.0+)
- npm (v9.0.0+)
- MongoDB Community Server (v6.0+) or MongoDB Atlas cloud account

### Backend Setup
1. Navigate to the backend folder and install packages:
   ```bash
   cd backend
   npm install
   ```
2. Seed the database with default products and default admin account (`baghelbrijendra7@gmail.com` / `brijendra7`):
   ```bash
   npm run seed
   ```
3. Start the backend development server (includes automated restart on changes):
   ```bash
   npm run dev
   ```

### Frontend Setup
1. In a second terminal window, navigate to the frontend folder and install packages:
   ```bash
   cd frontend
   npm install
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

---

## 📌 API Reference

**Base Endpoint:** `http://localhost:5000/api`

### Auth & User Endpoints
- `POST /auth/signup` - Registers a new user account.
- `POST /auth/login` - Authenticates user credentials, returns JWT.
- `POST /auth/social-login` - Social logins (Google/Facebook mocks) integration.
- `POST /auth/forgot-password` - Dispatches 6-digit OTP to user email.
- `POST /auth/reset-password` - Resets password using the verified OTP code.
- `GET /auth/me` - Fetches authenticated profile details (JWT required).
- `PUT /auth/profile` - Updates profile details and avatar.
- `GET /auth/wishlist` - Fetches the user's saved items.
- `POST /auth/wishlist/toggle` - Adds or removes items in the user's wishlist.

### Product Endpoints
- `GET /products` - Lists all products. Supports query params: `category`, `search`, `featured`.
- `GET /products/:id` - Fetches specific product description and specifications by ID.

### Order Endpoints
- `POST /orders` - Creates a verified order (calculates totals server-side).
- `GET /orders/me` - Lists all historic orders for the authenticated user.

---

## 📦 Production Deployment

### 1. Build the Frontend Assets
Compile optimized HTML, CSS, and JS static bundles:
```bash
cd frontend
npm run build
```
Deployment packages are created inside the `frontend/dist` folder.

### 2. Run the Backend Production Server
Run the production Node server:
```bash
cd backend
NODE_ENV=production npm start
```

### 3. Deployment Checklist
- Set `NODE_ENV=production` on hosting dashboards.
- Generate a new, secure `JWT_SECRET` value.
- Update `FRONTEND_URL` on the backend to match the production host name.
- Point `VITE_API_URL` to your production backend URL.
- White-list server IP addresses in MongoDB Atlas or database access panels.

---

## 🔧 Troubleshooting

### Local MongoDB Connection Fails
If you receive a connection error, make sure your database service is running:
- **Windows:** Run `net start MongoDB` in an administrator shell, or check your Services panel.
- **Cloud Database:** If using MongoDB Atlas, check that the network whitelist allows connection requests from `0.0.0.0/0` or your current IP.

### Caching Fallback Warning
If you see `⚠️ Could not connect to Redis. Running in DB-only mode`, it means Redis is not running locally. The application gracefully disables cache checks and routes all queries directly to MongoDB.

### Port Conflict (5000 / 5173)
If ports are occupied, locate the process PID and terminate it, or change the server `PORT` variable in the respective `.env` files.

