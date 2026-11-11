# Investment Management API

A Node.js REST API backend for an investment management platform with JWT authentication, ROI tracking, and a multi-level referral commission system.

## Features

- User registration and login with JWT authentication
- Investment plan management with daily ROI tracking
- 3-level referral commission system (paid by company)
- Wallet balance and income tracking
- Rate limiting and input validation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, bcryptjs, rate limiting

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Omii2510/investment-management-.git
   cd investment-management-
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory
   ```bash
   cp .env.example .env
   ```

4. Fill in your environment variables in `.env`
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d
   ```

5. Start the server
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

### Investments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/investments` | Create a new investment |
| GET | `/api/investments` | Get all investments of logged-in user |
| GET | `/api/investments/:id` | Get investment by ID |
| POST | `/api/investments/:id/distribute-roi` | Distribute daily ROI and pay referral commissions |

### Referrals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/referrals/direct` | Get direct referrals of logged-in user |
| GET | `/api/referrals/tree` | Get full referral hierarchy |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get user financial summary |

## Referral Commission System

Commissions are paid by the company — the earner's ROI is never deducted.

| Level | Relationship | Commission |
|-------|-------------|------------|
| Level 1 | Direct parent | 5% of ROI |
| Level 2 | 2 levels up | 3% of ROI |
| Level 3 | 3 levels up | 2% of ROI |

Level 4 and above receive no commission.

## Project Structure

```
investment-management/
├── config/
│   ├── db.js                  # MongoDB connection
│   └── investmentPlans.js     # Investment plan definitions
├── controllers/
│   ├── authController.js
│   ├── dashboardController.js
│   ├── investmentController.js
│   └── referralController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── rateLimitMiddleware.js
│   └── validationMiddleware.js
├── models/
│   ├── User.js
│   ├── Investment.js
│   ├── ROIHistory.js
│   └── ReferralIncome.js
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── investmentRoutes.js
│   └── referralRoutes.js
├── utils/
│   └── referralCommissions.js # Commission distribution logic
├── validators/
│   └── authValidators.js
├── .env.example
└── server.js
```

## License

MIT
