# Database Schema

MongoDB Atlas. All collections are managed via Mongoose.

---

## Collections

### users

Stores registered user accounts.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | Primary key |
| `fullName` | String | ✅ | Trimmed |
| `email` | String | ✅ | Unique, lowercase |
| `mobileNumber` | String | ✅ | Unique |
| `password` | String | ✅ | bcrypt hashed, `select: false` |
| `referralCode` | String | ✅ | Unique, uppercase, format: `USR` + 12 hex chars |
| `referredBy` | ObjectId → User | ❌ | `null` if no referrer |
| `walletBalance` | Number | — | Default `0`, min `0` |
| `totalROIEarned` | Number | — | Default `0`, cumulative ROI received |
| `totalLevelIncomeEarned` | Number | — | Default `0`, cumulative referral commissions |
| `accountStatus` | String | — | Enum: `Active`, `Inactive`, `Suspended`. Default `Active` |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

**Indexes**
```
email          — unique
mobileNumber   — unique
referralCode   — unique
referredBy     — non-unique (for referral lookups)
```

---

### investments

Stores each investment made by a user.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | Primary key |
| `user` | ObjectId → User | ✅ | Owner of the investment |
| `investmentAmount` | Number | ✅ | Min `0.01` |
| `planDetails.planName` | String | ✅ | Snapshot from investmentPlans.js at creation time |
| `planDetails.durationDays` | Number | ✅ | |
| `planDetails.description` | String | — | Default `""` |
| `startDate` | Date | ✅ | Set to `new Date()` at creation |
| `endDate` | Date | ✅ | `startDate + durationDays` |
| `dailyROIPercentage` | Number | ✅ | Snapshot from plan at creation time |
| `investmentStatus` | String | — | Enum: `Active`, `Completed`, `Cancelled`. Default `Active` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes**
```
{ user: 1, investmentStatus: 1 }   — compound (filter active investments per user)
{ endDate: 1 }                     — for expiry checks in cron job
```

> Plan details are **snapshotted** at creation time so changing `investmentPlans.js` does not affect existing investments.

---

### roihistories

One record per investment per day. Prevents duplicate ROI credits.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | |
| `user` | ObjectId → User | ✅ | Investor who received the ROI |
| `investment` | ObjectId → Investment | ✅ | Source investment |
| `roiAmount` | Number | ✅ | Min `0` |
| `date` | Date | ✅ | UTC midnight of the credit day |
| `status` | String | — | Enum: `Pending`, `Credited`, `Failed`. Default `Pending` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes**
```
{ user: 1, date: -1 }              — fetch ROI history per user
{ investment: 1, date: -1 }        — fetch ROI history per investment
{ investment: 1, date: 1 }         — UNIQUE — prevents duplicate daily ROI
```

The unique index on `{ investment, date }` is the idempotency guard. If the cron job runs twice in a day, the second insert throws a duplicate key error (code `11000`) which is caught and silently skipped.

---

### referralincomes

One record per commission payment. Created whenever ROI is distributed.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | |
| `receiver` | ObjectId → User | ✅ | Ancestor who receives the commission |
| `generatedBy` | ObjectId → User | ✅ | Investor whose ROI triggered the commission |
| `referralLevel` | Number | ✅ | Min `1` (1 = direct parent, 2 = grandparent, 3 = great-grandparent) |
| `incomeAmount` | Number | ✅ | Min `0.01` |
| `date` | Date | — | Default `Date.now` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes**
```
{ receiver: 1, date: -1 }          — fetch income history per user
{ generatedBy: 1 }                 — trace commissions from a specific investor
{ receiver: 1, referralLevel: 1 }  — filter by level per user
```

---

## Relationships

```
User ──────────────────────────────────────────────────────┐
 │  referredBy (self-referential)                           │
 └──► User                                                  │
                                                            │
User ──────────────────────────────────────────────────────┤
 │  _id                                                     │
 └──► Investment.user                                       │
           │                                                │
           └──► ROIHistory.investment                       │
           └──► ROIHistory.user ──────────────────────────►┘
                                                            │
ReferralIncome.receiver ─────────────────────────────────►┘
ReferralIncome.generatedBy ──────────────────────────────►┘
```

---

## Investment Plans (config — not a collection)

Defined in `config/investmentPlans.js`. Not stored in MongoDB — values are snapshotted into the `investments` collection at creation time.

| planCode | planName | minAmount | maxAmount | dailyROI | durationDays |
|----------|----------|-----------|-----------|----------|--------------|
| `STARTER` | Starter Plan | ₹1,000 | ₹9,999 | 1.0% | 30 |
| `GROWTH` | Growth Plan | ₹10,000 | ₹49,999 | 1.5% | 60 |
| `PREMIUM` | Premium Plan | ₹50,000 | ₹5,00,000 | 2.0% | 90 |
