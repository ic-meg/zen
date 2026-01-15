# zen-backend

This README documents the backend service for the "zen" project with a focus on the language and technology stack and the API endpoints (inferred from the source folders). It is intended as a quick reference for developers and API consumers.

## Overview

The backend is a TypeScript Node.js application built with the NestJS framework. It provides REST endpoints for authentication, product and order management, cart operations, payments, and file uploads. The project uses Prisma as the ORM and includes database migrations and seed scripts.

## Language and tech stack

- Language: TypeScript (compiled to Node.js)
- Runtime: Node.js (v16+ recommended)
- Framework: NestJS (modular, controller/service pattern)
- ORM: Prisma (schema located in `prisma/schema.prisma`)
- Database: PostgreSQL (inferred; Prisma supports PostgreSQL; replace with your provider in `DATABASE_URL`)
- Authentication: JWT (JSON Web Tokens)
- Payment integration: Paymongo (service helpers located in `src/services/paymongoServices.js`)
- File uploads: Uploads handled via an uploads module (multer or cloud provider configuration may apply)
- Testing: Jest (standard NestJS testing setup exists under `test/`)

## API conventions

- Base URL (development): http://localhost:3000
- Content types: application/json for API requests, multipart/form-data for file uploads
- Authentication: Bearer token via the `Authorization: Bearer <token>` header for protected routes
- Role-based guards: some endpoints (product management, order management) are expected to be protected and restricted to admin users

## Inferred endpoints

The following endpoints are inferred from the backend folders and typical REST patterns. These may not list every route or exact query parameters — consult the controller source files for precise request/response shapes.

- Auth
  - POST /auth/register — create a new user (email, password)
  - POST /auth/login — authenticate and receive JWT
  - GET /auth/verify?token= — email verification (if implemented)
  - POST /auth/refresh — refresh access token (optional)

- Products
  - GET /products — list products (pagination / filters optional)
  - GET /products/:id — get product details
  - POST /products — create product (admin)
  - PUT /products/:id — update product (admin)
  - DELETE /products/:id — delete product (admin)

- Cart
  - GET /cart — get current user's cart
  - POST /cart — add item to cart
  - PUT /cart — update cart item quantity
  - DELETE /cart/:itemId — remove item from cart

- Orders
  - POST /orders — create an order from cart / checkout
  - GET /orders — list orders for user (admin can list all)
  - GET /orders/:id — order details
  - PUT /orders/:id/status — update order status (admin)

- Payments
  - POST /payments — initiate payment / create payment intent (Paymongo)
  - POST /payments/webhook — payment provider webhook (verify signatures)

- Uploads
  - POST /uploads — upload files (images for products, etc.)

Notes: exact route names may vary (for example `/payments/create` or `/payments/charge`). Please check `src/` controller files (for example `src/payments/*`, `src/products/*`, `src/auth/*`, `src/cart/*`, `src/orders/*`) to confirm the exact paths and payloads.

## Environment variables

Create a `.env` file in the `zen-backend` root (or provide environment variables in your deployment). Typical variables used by this backend include:

- PORT=3000
- NODE_ENV=development
- DATABASE_URL=postgresql://user:pass@host:port/dbname
- JWT_SECRET=your_jwt_secret
- JWT_EXPIRES_IN=1h
- PAYMONGO_SECRET_KEY=sk_test_...
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS — for transactional emails
- STORAGE_PROVIDER (local | s3 | cloudinary) — if uploads are configurable

Adjust variables to your environment. The exact variable names used in code may differ; search `process.env` references in the `src/` folder to confirm.

## Local development

1. Install dependencies

```bash
npm install
```

2. Run database migrations and seed (Prisma)

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

3. Start the server in watch mode

```bash
npm run start:dev
```

The API will be available at http://localhost:3000 by default.

## Running tests

Run unit tests and e2e tests with the npm scripts in `package.json`:

```bash
npm run test
npm run test:e2e
```

## Admin / protected routes

Product and order management endpoints are typically restricted to admin users. Ensure your JWT contains a role/claim that the backend recognizes, and include the token in the `Authorization` header.

## Assumptions and notes

- This README focuses on the language and tech stack and provides an inferred list of endpoints based on the repository structure. If you want a verbatim, source-derived API reference (full paths, request/response schemas), I can generate one by reading the controller files and producing OpenAPI/Swagger-style documentation.
- If your project exposes Swagger at runtime (for example `/api` or `/docs`), start the server and visit that path to get the canonical API spec.

## Next steps (optional)

- Generate an OpenAPI spec from controller decorators and include a `docs/` directory.
- Add example requests (curl or Postman collection) for each endpoint.
- Add a small README snippet per controller with request/response examples.

## License

See the repository root for license information.
