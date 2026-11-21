# Investment Management — API Reference

Base URL: `http://localhost:5000/api`

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

## Auth

### POST `/auth/register`
Register a new user.

**Body**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "password": "password123",
  "referralCode": "USR123ABC"
}
```
> `referralCode` is optional.

**Response `201`**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "<jwt>",
  "data": {
    "id": "<userId>",
    "fullName": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "referralCode": "USR...",
    "referredBy": "<userId | null>"
  }
}
```

**Errors**
| Status | Message |
|--------|---------|
| 400 | All fields are required |
| 400 | Password must contain at least 8 characters |
| 400 | Please enter a valid email address |
| 400 | Invalid referral code |
| 409 | Email or mobile number already registered |

---

### POST `/auth/login`
Login and receive a JWT token.

**Body**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response `200`**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "data": {
    "id": "<userId>",
    "fullName": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "referralCode": "USR...",
    "walletBalance": 0
  }
}
```

**Errors**
| Status | Message |
|--------|---------|
| 400 | Email and password are required |
| 401 | Invalid email or password |
| 403 | Your account is not active |

---

### GET `/auth/me` 🔒
Get the authenticated user's profile.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "id": "<userId>",
    "fullName": "John Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "referralCode": "USR...",
    "referredBy": "<userId | null>",
    "walletBalance": 500.00,
    "totalROIEarned": 450.00,
    "totalLevelIncomeEarned": 50.00,
    "accountStatus": "Active",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Investments

### GET `/investments/plans`
Get all enabled investment plans. Public — no auth required.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "planCode": "STARTER",
      "planName": "Starter Plan",
      "minAmount": 1000,
      "maxAmount": 9999,
      "durationDays": 30,
      "dailyROIPercentage": 1.0,
      "description": "1% daily ROI for 30 days"
    }
  ]
}
```

---

### POST `/investments` 🔒
Create a new investment.

**Body**
```json
{
  "planCode": "STARTER",
  "investmentAmount": 5000
}
```

**Response `201`**
```json
{
  "success": true,
  "message": "Investment created successfully",
  "data": {
    "_id": "<investmentId>",
    "user": "<userId>",
    "investmentAmount": 5000,
    "planDetails": {
      "planName": "Starter Plan",
      "durationDays": 30,
      "description": "1% daily ROI for 30 days"
    },
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T00:00:00.000Z",
    "dailyROIPercentage": 1.0,
    "investmentStatus": "Active"
  }
}
```

**Errors**
| Status | Message |
|--------|---------|
| 400 | Plan code and investment amount are required |
| 400 | Investment amount must be a positive number |
| 400 | Invalid or unavailable investment plan |
| 400 | Investment amount must be between {min} and {max} |

---

### GET `/investments` 🔒
Get all investments of the logged-in user. Supports pagination.

**Query Params**
| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Results per page (max 100) |

**Response `200`**
```json
{
  "success": true,
  "pagination": { "total": 3, "page": 1, "limit": 10, "totalPages": 1 },
  "data": [ /* array of investment objects */ ]
}
```

---

### GET `/investments/:id` 🔒
Get a single investment by ID.

**Response `200`**
```json
{
  "success": true,
  "data": { /* investment object */ }
}
```

**Errors**
| Status | Message |
|--------|---------|
| 400 | Invalid investment ID |
| 404 | Investment not found |

---

### GET `/investments/:id/roi-history` 🔒
Get daily ROI history for a specific investment.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "investment": "<investmentId>",
      "roiAmount": 50.00,
      "date": "2024-01-01T00:00:00.000Z",
      "status": "Credited"
    }
  ]
}
```

---

### POST `/investments/:id/distribute-roi` 🔒
Manually trigger daily ROI distribution for an investment. Also pays referral commissions up to 3 levels.

**Response `200`**
```json
{
  "success": true,
  "message": "ROI distributed and referral commissions paid successfully",
  "data": { "roiAmount": 50.00 }
}
```

**Errors**
| Status | Message |
|--------|---------|
| 400 | Invalid investment ID |
| 404 | Active investment not found |
| 409 | ROI already distributed for today |

---

## Referrals

### GET `/referrals/income` 🔒
Get all referral commission income received by the logged-in user.

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "generatedBy": { "fullName": "Jane Doe", "referralCode": "USR..." },
      "referralLevel": 1,
      "incomeAmount": 25.00,
      "date": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/referrals/direct` 🔒
Get users directly referred by the logged-in user. Supports pagination.

**Query Params:** `page`, `limit` (same as investments)

**Response `200`**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 2,
    "referrals": [
      { "fullName": "Jane Doe", "referralCode": "USR...", "accountStatus": "Active", "createdAt": "..." }
    ],
    "pagination": { "currentPage": 1, "totalPages": 1, "limit": 10, "totalRecords": 2 }
  }
}
```

---

### GET `/referrals/tree` 🔒
Get the full referral hierarchy grouped by level.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "totalReferrals": 5,
    "totalLevels": 3,
    "levels": [
      {
        "level": 1,
        "totalUsers": 2,
        "users": [ { "fullName": "...", "referralCode": "...", "accountStatus": "Active" } ]
      }
    ]
  }
}
```

---

## Dashboard

### GET `/dashboard` 🔒
Get the logged-in user's financial summary.

**Response `200`**
```json
{
  "success": true,
  "data": {
    "totalInvestments": 15000,
    "investmentCount": 2,
    "totalROIEarned": 450.00,
    "totalLevelIncomeEarned": 50.00,
    "walletBalance": 500.00
  }
}
```

---

## Admin

### POST `/admin/run-roi-job` 🔒
Manually trigger the daily ROI job for all active investments.

**Response `200`**
```json
{
  "success": true,
  "message": "ROI job executed successfully"
}
```

---

## Referral Commission Rates

Commissions are paid by the company — the investor's ROI is never deducted.

| Level | Relationship | Rate |
|-------|-------------|------|
| 1 | Direct parent | 5% of ROI |
| 2 | 2 levels up | 3% of ROI |
| 3 | 3 levels up | 2% of ROI |

---

## Common Error Responses

### 401 Unauthorized
```json
{ "success": false, "message": "Not authorized. Token not provided." }
```

### 404 Not Found
```json
{ "success": false, "message": "Route not found: /api/unknown" }
```

### 500 Internal Server Error
```json
{ "success": false, "message": "Internal Server Error" }
```
