# Buyez - E-commerce Web Application

Buyez is a MERN-stack e-commerce project with a React frontend, an Express REST API, and MongoDB persistence. The interface covers product discovery, product details, a persistent shopping cart, checkout, account verification, order history, and an administrator portal.

> **Configuration and security:** The ZIP intentionally excludes real `.env` files, Git history, dependency folders, build output, and temporary upload files. Create `backend/.env` from `backend/.env.example` and add your own credentials. Never submit database passwords, JWT secrets, SMTP app passwords, or Cloudinary secrets.

## Main features

### Customer experience
- Home page with a hero panel, featured products, service highlights, and promotional panels.
- Shop catalogue populated from the products API.
- Dynamic category filters derived from available product records, text search, and client-side sorting.
- Product detail pages with price, description, stock status, quantity controls, and Add to Cart / Buy Now actions.
- Shopping cart with quantity updates, item removal, subtotal, delivery calculation, and persisted cart state using `localStorage`.
- Checkout form for delivery details and Cash on Delivery order placement.
- Order confirmation and order history with order status and delivery details.
- Account registration, login, email OTP verification, OTP resend, and sign-out.

### Administrator experience
- Role-protected admin route.
- Overview cards for revenue, orders, catalogue products, and registered users.
- Product inventory view and product creation with optional Cloudinary image upload.
- Product deletion and order-status updates.
- User list showing roles and verification status.

## Technology stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, JavaScript (ES modules) |
| Styling | Tailwind CSS 4, custom CSS variables |
| Routing | React Router 7 |
| Icons | Lucide React |
| Shared state | React Context API for authentication and cart; a Wishlist Context module is present but is not currently mounted in the app provider tree |
| Backend | Node.js, Express 5 |
| Data | MongoDB and Mongoose |
| Authentication | JSON Web Tokens and bcryptjs password hashing |
| Email | Nodemailer for OTP and order-related emails |
| Product images | Cloudinary integration |

## Project structure

```text
Buyez/
├── README.md
├── backend/
│   ├── config/           # MongoDB and Cloudinary configuration
│   ├── controllers/      # Authentication, products, orders, analytics
│   ├── middlewares/      # Authentication and admin authorization
│   ├── model/            # User, Product, Order Mongoose models
│   ├── routes/           # REST API route definitions
│   ├── util/             # Email utility
│   ├── .env.example      # Environment-variable template
│   ├── Seed.js           # Optional demo-data seeder
│   └── index.js          # Express application entry point
└── frontend/
    └── buyez/
        ├── public/
        ├── src/
        │   ├── components/  # Navbar, top bar, footer, product card, admin route
        │   ├── context/     # Authentication, cart, wishlist contexts
        │   ├── pages/       # Home, shop, detail, cart, checkout, orders, login, admin
        │   ├── App.jsx      # Route composition
        │   └── main.jsx     # React entry point and providers
        ├── package.json
        └── vite.config.js
```

## Requirements

- Node.js **22.12 or newer** is recommended for the Vite version in this project.
- npm (comes with Node.js).
- A reachable MongoDB instance (local MongoDB or MongoDB Atlas).
- SMTP credentials for email OTP and confirmation emails.
- Cloudinary credentials if you intend to test administrator product-image uploads.

## Run locally

### 1. Configure the backend

Open a terminal at the project root:

```bash
cd backend
npm install
```

Copy the environment template to a local `.env` file:

**Windows PowerShell**
```powershell
Copy-Item .env.example .env
```

**macOS / Linux**
```bash
cp .env.example .env
```

Edit `backend/.env` and set a real MongoDB connection string, a strong `JWT_SECRET`, SMTP credentials, and Cloudinary credentials if needed. Keep `PORT=3000`: the Vite development proxy forwards `/api` requests to `http://localhost:3000`.

Start the API:

```bash
npm run dev
```

The backend root endpoint can be checked at `http://localhost:3000/`; it should return `Backend working` after the server starts.

### 2. Configure and run the frontend

Open a **second terminal** from the project root:

```bash
cd frontend/buyez
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The Vite config proxies frontend `/api` requests to the backend on port 3000.

### 3. Optional sample data

The backend provides a seed script:

```bash
cd backend
npm run seed
```

**Warning:** `Seed.js` deletes existing users, products, and orders before inserting demo data. Run it only against a disposable development database whose contents you are prepared to lose. Do not run it on a production or personal database.

## API summary

| Method | Endpoint | Purpose | Access |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Create account and initiate email OTP verification | Public |
| `POST` | `/api/auth/login` | Authenticate and return a JWT-backed user payload | Public |
| `POST` | `/api/auth/verify-otp` | Verify registration OTP | Authenticated |
| `POST` | `/api/auth/resend-otp` | Resend verification OTP | Authenticated |
| `GET` | `/api/auth/users` | List users for the admin portal | Admin |
| `GET` | `/api/products` | Fetch product catalogue | Public |
| `GET` | `/api/products/:id` | Fetch a product by ID | Public |
| `POST` | `/api/products` | Create product; multipart field `image` is accepted | Admin |
| `PUT` / `DELETE` | `/api/products/:id` | Update or delete product | Admin |
| `POST` | `/api/orders` | Place an order | Authenticated |
| `GET` | `/api/orders/myOrders` | Fetch the signed-in user's orders | Authenticated |
| `GET` | `/api/orders` | List all orders | Admin |
| `PUT` | `/api/orders/:id/status` | Update an order status | Admin |
| `GET` | `/api/analytics` | Retrieve store summary metrics | Admin |

## Design and implementation notes

- The interface uses an off-white background, deep evergreen primary actions, warm neutral promotional panels, serif display headings, and sans-serif body copy.
- Layouts use responsive Tailwind utilities. The mobile navigation can be expanded from the hamburger control; catalogue product cards use a two-column grid at narrow viewport widths.
- `App.jsx` composes the application routes. Shared navigation, footer, top bar, product cards, and context providers are reused across views.
- The authentication, cart, and wishlist contexts keep shared state out of individual page components. Cart and signed-in user information are persisted in browser `localStorage`. A WishlistContext module exists in the source tree but is not currently connected to the rendered application flow.
- The product catalogue is fetched with the browser `fetch` API. Category matching, catalogue text search, and sorting are performed on the fetched product list in the frontend.

## Verification and known boundaries

The supplied project was reviewed against the local UI walkthrough evidence for the home page, catalogue, product details, login/register/OTP, cart, checkout, order confirmation/history, account, and admin views. Responsive behavior was also viewed in browser device emulation at approximately 375 × 645 CSS pixels. This is manual visual evidence, not a substitute for exhaustive testing on physical devices.

- An automated test framework and test suite are **not configured** in the current repository. The backend `test` script is a placeholder.
- Razorpay dependencies and payment route files are present, but the payment route is commented out in `backend/index.js`; checkout currently presents Cash on Delivery and creates an order without live Razorpay processing.
- A full keyboard, screen-reader, and automated accessibility audit has not been documented. Before production use, verify keyboard navigation, visible focus, names for icon-only controls, color contrast, form error announcements, and touch targets.
- The frontend development proxy assumes the API is on `localhost:3000`. Update `frontend/buyez/vite.config.js` if the backend is hosted elsewhere.

## Task 2 deliverables

This README is included to satisfy the requirement for clear setup instructions, the technologies and libraries used, project structure, implementation approach, and local run steps. A separate supporting report documents the front-end pages, evaluation criteria mapping, responsiveness evidence, and manual walkthrough evidence in `docs/Task2_Frontend_Development_Report.docx` when included in the submission package.
