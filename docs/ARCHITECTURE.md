# Architecture

## Overview

The system is split into two independent applications:

- **Backend** — Node.js/Express REST API (`/`)
- **Frontend** — React SPA (`/dashboard`)

They communicate over HTTP. The frontend holds a JWT in `localStorage` and sends it as a `Bearer` token on every protected request.

---

## Backend Layer Structure

```
HTTP Request
     │
     ▼
[ Rate Limiter ]          ← rateLimitMiddleware.js (auth routes only)
     │
     ▼
[ express-validator ]     ← validators/authValidators.js + validationMiddleware.js
     │
     ▼
[ JWT Protect ]           ← middleware/authMiddleware.js (protected routes only)
     │
     ▼
[ Controller ]            ← controllers/*.js  (business logic)
     │
     ▼
[ Mongoose Model ]        ← models/*.js  (MongoDB queries)
     │
     ▼
[ MongoDB Atlas ]
```

---

## Request Flow — Example: Create Investment

```
POST /api/investments
     │
     ├─ authMiddleware.protect()
     │     Verifies JWT → attaches req.user
     │
     ├─ investmentController.createInvestment()
     │     1. Validates planCode + amount
     │     2. Looks up plan in investmentPlans.js
     │     3. Checks amount is within plan min/max
     │     4. Calculates startDate + endDate
     │     5. Investment.create(...)
     │
     └─ Response 201
```

--- 

## Daily ROI Flow

The cron job (`jobs/dailyROIJob.js`) runs every day at **12:00 AM IST**.  
It can also be triggered manually via `POST /api/admin/run-roi-job`.

```
scheduleDailyROIJob()  ←  node-cron  (00:00 Asia/Kolkata)
     │
     ▼
runDailyROIJob()
     │
     ├─ Find all investments where status = "Active" AND startDate <= now
     │
     ├─ For each investment → processInvestmentROI(investment, today)
     │     │
     │     ├─ Calculate roiAmount = (investmentAmount × dailyROIPercentage) / 100
     │     │
     │     ├─ ROIHistory.create({ investment, date: today, ... })
     │     │     └─ Unique index on { investment, date } prevents duplicates
     │     │
     │     ├─ User.findByIdAndUpdate → $inc walletBalance + totalROIEarned
     │     │
     │     ├─ If new Date() >= endDate → mark investment "Completed"
     │     │
     │     └─ distributeReferralCommissions(userId, roiAmount, investmentId)
     │
     └─ Log: Credited / Skipped (duplicate) / Failed counts
```

---

## Referral Commission Flow

Triggered after every ROI credit (both cron job and manual distribute-roi).

```
distributeReferralCommissions(earnerId, roiAmount, investmentId)
     │
     ├─ Level 1: Find earnerId.referredBy  → pay 5% of roiAmount
     │
     ├─ Level 2: Find level1User.referredBy → pay 3% of roiAmount
     │
     ├─ Level 3: Find level2User.referredBy → pay 2% of roiAmount
     │
     └─ Stop if no more ancestors or level > 3
```

For each ancestor:
1. `User.findByIdAndUpdate` → `$inc walletBalance + totalLevelIncomeEarned`
2. `ReferralIncome.create(...)` — records the transaction

Commission is **paid by the company** — the investor's ROI amount is never reduced.

---

## Frontend Structure

```
App.js
 ├─ AuthProvider (context/AuthContext.js)
 │     Stores token + user in localStorage
 │     Exposes: loginUser(), logout(), token, user
 │
 ├─ /login        → pages/Login.js
 ├─ /register     → pages/Register.js
 └─ /             → pages/Dashboard.js  (PrivateRoute)
       │
       ├─ fetchAll() — loads all data in parallel with Promise.allSettled
       │     getDashboard(), getInvestments(), getROIHistory(id),
       │     getReferralIncome(), getReferralTree()
       │
       ├─ components/StatCard.js         — financial summary cards
       ├─ components/EarningsChart.js    — ROI + commission bar chart
       ├─ components/DataTable.js        — reusable table with loading/empty states
       ├─ components/ReferralTree.js     — referral hierarchy by level
       ├─ components/CreateInvestmentModal.js  — new investment form
       └─ components/ProfileModal.js     — user profile + referral code copy
```

---

## Security

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT signed with `JWT_SECRET`, expires in `JWT_EXPIRES_IN` |
| Password storage | bcryptjs with salt rounds = 12 |
| HTTP headers | helmet() — sets X-Content-Type, CSP, HSTS, etc. |
| Rate limiting | express-rate-limit on `/api/auth/*` routes |
| Input validation | express-validator on register + login |
| Token exposure | `password` field has `select: false` in User schema |
| CORS | Configured to allow credentials |
| Payload size | express.json limit set to 10kb |
