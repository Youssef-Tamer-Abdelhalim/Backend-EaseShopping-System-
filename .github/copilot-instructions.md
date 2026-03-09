# Copilot Instructions — EaseShopping Backend

## Commands

```bash
npm run dev      # development server with nodemon (NODE_ENV=development)
npm run prod     # production server with plain node (NODE_ENV=production)
```

No test or lint scripts are defined in package.json. ESLint config exists at `.eslintrc.json`.

## Architecture

Express.js REST API with MongoDB (Mongoose). All routes are prefixed `/api/v1/`.

**Layer order for any feature:**
```
routes/ → services/ (business logic + controller) → models/
```
Routes are thin — they compose middleware and delegate directly to service functions. There are no separate controller files.

**Reusable factory handlers** (`services/handlersFactroy.js`):
Generic `getAll`, `getOne`, `createOne`, `updateOne`, `deleteOne` functions used by most entities. When adding a simple CRUD entity, use these instead of writing handlers from scratch.

**Query features** (`utils/apiFeatures.js`):
All `getAll` handlers use `ApiFeatures` for filtering (`gte/gt/lte/lt` operators), sorting, field limiting, keyword search (regex on `name`/`title`/`description`), and pagination. Pagination returns `nextPage`/`prevPage` metadata.

## Key Conventions

**Error handling:**
- Throw `new ApiError("message", statusCode)` from `utils/apiError.js` for operational errors.
- All async route handlers must be wrapped with `express-async-handler`.
- The global error middleware (`middleware/errorMiddleware.js`) sends full stack in dev, sanitized message in prod, and handles JWT-specific errors automatically.

**Response format:**
```js
// Success
res.status(200).json({ status: "success", data: { ... } })
// Error (handled by middleware)
{ status: "Fail" | "Error", message: "..." }
```

**Validation:**
- Validation rules live in `utils/validator/<entity>Validator.js` using `express-validator`.
- Apply validators as middleware arrays on routes before the service function.
- Validation errors are caught by `middleware/validatorMiddleWare.js`.

**Authentication & Authorization:**
- JWT in `Authorization: Bearer <token>` header. Expires in 90 days.
- Use `protect` from `services/authServices.js` to guard routes.
- Use `allowedTo("admin", "manager")` after `protect` to restrict by role.
- Roles: `user`, `manager`, `admin`.
- Changing a user's password invalidates existing tokens (checked via `passwordChangedAt`).

**Image uploads:**
- Use helpers from `middleware/uploadImageMiddleware.js` (`uploadSingleImage` / `uploadMixOfImages`).
- Multer validates mime type. Files are uploaded to Cloudinary under `e-commerce/<folderName>/`.
- Add image processing in the service after upload.

**Stripe webhook:**
- The `/webhook-checkout` endpoint is registered before CORS in `server.js` and requires a raw body. Do not move it or wrap it in CORS.

## Domain Models

| Model | Key fields |
|---|---|
| User | name, email, password (bcrypt), role, wishlist (Product refs), addresses[] |
| Product | title, price, quantity, colors[], images[], category, brand, ratingsAverage |
| Category / SubCategory / Brand | name, slug (auto-generated) |
| Cart | cartItems[], totalCartPrice, totalPriceAfterDiscount, user |
| Order | cartItems[], paymentMethodType (`online`\|`cash`), isPaid, isDelivered |
| Review | rating, title, user, product |
| Coupon | name, expire, discount |

## Environment Variables

Required — see `.env.example`:
- `DB_URI` — MongoDB Atlas connection string
- `JWT_SECRET_KEY`, `JWT_EXPIRE_TIME`
- `STRIPE_SECRET`, `STRIPE_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` (Brevo SMTP)
- `CORS_ORIGINS` — comma-separated allowed origins
- `BASE_URL`, `FRONTEND_URL`

## Docker

Three-service compose stack: MongoDB → Node API → Nginx (port 80). The API container runs `npm run prod`. MongoDB data is persisted via a named volume. All services share `shopping-network`.
