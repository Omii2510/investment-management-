# Changelog

All notable changes to this project will be documented here.

Format: [Semantic Versioning](https://semver.org/) — `MAJOR.MINOR.PATCH`

---

## [1.1.0] — 2025

### Added
- `GET /api/investments/plans` — public endpoint to list available investment plans
- `GET /api/investments/:id/roi-history` — per-investment ROI history endpoint
- `GET /api/referrals/income` — referral commission income history endpoint
- `POST /api/admin/run-roi-job` — manual trigger for the daily ROI cron job
- React frontend dashboard with earnings chart, referral tree, investment history tables
- `ProfileModal` component with referral code copy button
- `CreateInvestmentModal` with plan selection and amount validation
- Loading and empty states across all dashboard components
- `Promise.allSettled` in dashboard fetch so partial API failures don't wipe all data

### Fixed
- Removed unused `bcrypt` import in `authController` — login now uses `user.comparePassword()`
- Removed duplicate inline `require("../models/ROIHistory")` inside `getROIHistory`
- Removed unused `Cell` import from recharts in `EarningsChart`
- `StatCard` no longer renders `₹undefined` while summary data is loading
- Generic `"Server error"` messages in `referralController` replaced with descriptive messages

### Changed
- `CreateInvestmentModal` plan fetch errors are now shown to the user instead of silently failing

---

## [1.0.0] — 2025

### Added
- User registration with unique referral code generation (`USR` + 12 hex chars)
- User login with JWT authentication
- `GET /api/auth/me` — authenticated user profile
- Investment creation with plan validation and amount range checks
- `POST /api/investments/:id/distribute-roi` — manual daily ROI distribution
- `GET /api/investments` — paginated investment list
- `GET /api/investments/:id` — investment detail
- Daily ROI cron job via `node-cron` (runs at 12:00 AM IST)
- Idempotent ROI processing — unique index on `{ investment, date }` prevents duplicate credits
- 3-level referral commission system (Level 1: 5%, Level 2: 3%, Level 3: 2%)
- `GET /api/dashboard` — financial summary (total invested, ROI earned, level income, wallet balance)
- `GET /api/referrals/direct` — paginated direct referrals
- `GET /api/referrals/tree` — full referral hierarchy via MongoDB `$graphLookup`
- JWT protect middleware with `TokenExpiredError` and `JsonWebTokenError` handling
- Global error handler for `CastError`, duplicate key (`11000`), and `ValidationError`
- Helmet security headers
- Rate limiting on auth routes
- express-validator on register and login
- 3 investment plans: Starter (1%/30d), Growth (1.5%/60d), Premium (2%/90d)
