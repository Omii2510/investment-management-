# Investment Management

A full-stack investment management platform with a Node.js/Express REST API backend and a React dashboard frontend. Features JWT authentication, daily ROI tracking, and a 3-level referral commission system.

## Features

- User registration and login with JWT authentication
- 3 investment plans with configurable daily ROI
- Automated daily ROI distribution via cron job
- 3-level referral commission system (paid by company, never deducted from investor)
- Wallet balance and income tracking
- React dashboard with earnings chart, referral tree, and investment history
- Rate limiting, input validation, and helmet security headers

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Security | Helmet, express-rate-limit |
| Scheduler | node-cron |
| Frontend | React (Create React App) |
| HTTP Client | Axios |
| Charts | Recharts |

## Project Structure

```
investment-management/
├── config/
│   ├── db.js                   # MongoDB connection
│   └── investmentPlans.js      # Investment plan definitions
├── controllers/
│   ├── authController.js       # Register, login, get profile
│   ├── dashboardController.js  # Financial summary
│   ├── investmentController.js # CRUD + ROI distribution
│   └── referralController.js   # Income, direct referrals, tree
├── jobs/
│   └── dailyROIJob.js          # Cron job — runs at 12:00 AM IST
├── middleware/
│   ├── authMiddleware.js       # JWT protect middleware
│   ├── errorMiddleware.js      # Global error handler
│   ├── rateLimitMiddleware.js  # Auth route rate limiter
│   └── validationMiddleware.js # express-validator error handler
├── models/
│   ├── User.js                 # User schema
│   ├── Investment.js           # Investment schema
│   ├── ROIHistory.js           # Daily ROI records
│   └── ReferralIncome.js       # Referral commission records
├── routes/
│   ├── adminRoutes.js          # Manual ROI job trigger
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── investmentRoutes.js
│   └── referralRoutes.js
├── utils/
│   └── referralCommissions.js  # Commission distribution logic
├── validators/
│   └── authValidators.js       # express-validator rules
├── dashboard/                  # React frontend
│   └── src/
│       ├── api/index.js        # Axios instance + API calls
│       ├── components/         # Reusable UI components
│       ├── context/            # Auth context (JWT state)
│       └── pages/              # Login, Register, Dashboard
├── .env.example
├── API.md                      # Full API reference
├── CHANGELOG.md
├── CONTRIBUTING.md
├── docs/
│   ├── ARCHITECTURE.md
│   └── DATABASE.md
└── server.js
```

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/Omii2510/investment-management-.git
   cd investment-management-
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create your `.env` file
   ```bash
   cp .env.example .env
   ```

4. Fill in environment variables
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=1d
   NODE_ENV=development
   ```

5. Start the server
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

### Frontend Setup

```bash
cd dashboard
npm install
npm start
```

The React app runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000`.

## API Endpoints

See [API.md](./API.md) for the full reference with request/response examples.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login and get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| GET | `/api/investments/plans` | — | List available plans |
| POST | `/api/investments` | ✅ | Create a new investment |
| GET | `/api/investments` | ✅ | Get all user investments |
| GET | `/api/investments/:id` | ✅ | Get investment by ID |
| GET | `/api/investments/:id/roi-history` | ✅ | Get ROI history for investment |
| POST | `/api/investments/:id/distribute-roi` | ✅ | Manually distribute daily ROI |
| GET | `/api/dashboard` | ✅ | Get financial summary |
| GET | `/api/referrals/income` | ✅ | Get referral commission history |
| GET | `/api/referrals/direct` | ✅ | Get direct referrals |
| GET | `/api/referrals/tree` | ✅ | Get full referral hierarchy |
| POST | `/api/admin/run-roi-job` | ✅ | Manually trigger ROI cron job |

## Referral Commission System

Commissions are paid by the company — the investor's ROI is never deducted.

| Level | Relationship | Commission |
|-------|-------------|------------|
| Level 1 | Direct parent | 5% of ROI |
| Level 2 | 2 levels up | 3% of ROI |
| Level 3 | 3 levels up | 2% of ROI |

Level 4 and above receive no commission.

## Investment Plans

| Plan | Min | Max | Daily ROI | Duration |
|------|-----|-----|-----------|----------|
| Starter | ₹1,000 | ₹9,999 | 1.0% | 30 days |
| Growth | ₹10,000 | ₹49,999 | 1.5% | 60 days |
| Premium | ₹50,000 | ₹5,00,000 | 2.0% | 90 days |

## Postman Testing

All 14 API endpoints have been fully tested using Postman.

| Category | Endpoints Tested |
|----------|------------------|
| Auth | Register, Login, Get Profile |
| Investments | List Plans, Create, Get All, Get by ID, ROI History, Distribute ROI |
| Dashboard | Financial Summary |
| Referrals | Income History, Direct Referrals, Referral Tree |
| Admin | Manual ROI Job Trigger |

Testing covered:
- ✅ Happy path — valid requests returning correct responses
- ✅ Auth errors — missing token, expired token, invalid token
- ✅ Validation errors — missing fields, invalid email, short password
- ✅ Business logic — duplicate ROI prevention, invalid plan code, amount out of range
- ✅ Referral commissions — 3-level payout verification after ROI distribution
- ✅ Rate limiting — auth route throttling behavior

See [API.md](./API.md) for the full request/response reference.

## Documentation

- [API Reference](./API.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Database Schema](./docs/DATABASE.md)
- [Changelog](./CHANGELOG.md)
- [Contributing](./CONTRIBUTING.md)

## License

MIT
