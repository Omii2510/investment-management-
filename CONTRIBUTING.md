# Contributing

## Getting Started

1. Fork the repository and clone your fork
   ```bash
   git clone https://github.com/<your-username>/investment-management-.git
   cd investment-management-
   ```

2. Install backend dependencies
   ```bash
   npm install
   ```

3. Install frontend dependencies
   ```bash
   cd dashboard && npm install
   ```

4. Copy `.env.example` to `.env` and fill in your values
   ```bash
   cp .env.example .env
   ```

5. Start both servers
   ```bash
   # Backend (from root)
   npm run dev

   # Frontend (from /dashboard)
   npm start
   ```

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<short-description>` | `feat/withdrawal-system` |
| Bug fix | `fix/<short-description>` | `fix/duplicate-roi-credit` |
| Documentation | `docs/<short-description>` | `docs/api-reference` |
| Refactor | `refactor/<short-description>` | `refactor/auth-controller` |

Always branch off `main`:
```bash
git checkout main
git pull origin main
git checkout -b feat/your-feature
```

---

## Commit Style

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short summary>
```

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change with no feature/fix |
| `chore` | Build, deps, config changes |

**Examples**
```
feat: add withdrawal endpoint
fix: prevent duplicate ROI on same day
docs: add database schema documentation
refactor: replace bcrypt.compare with user.comparePassword
chore: update node-cron to v3
```

---

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Update `CHANGELOG.md` under the relevant version section
- Make sure the backend starts without errors (`npm run dev`)
- Make sure the frontend builds without errors (`npm run build` inside `/dashboard`)
- Write a clear PR description explaining what changed and why

---

## Project Structure

See [README.md](./README.md#project-structure) for the full folder layout.

Key files to know before contributing:

| File | Purpose |
|------|---------|
| `server.js` | Express app setup and server start |
| `config/investmentPlans.js` | Add or modify investment plans here |
| `utils/referralCommissions.js` | Commission rates and distribution logic |
| `jobs/dailyROIJob.js` | Cron job — ROI processing logic |
| `middleware/authMiddleware.js` | JWT verification |
| `middleware/errorMiddleware.js` | Global error handler |
