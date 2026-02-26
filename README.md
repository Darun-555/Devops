# Devops Backend

Single Express + Mongoose backend for patient registration, wards, admissions, vitals, medication, and doctor notes.

## One MongoDB Cluster / One Database

Use exactly one connection string in `.env`:

```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
JWT_SECRET=change_me
JWT_EXPIRE=1h
```

Notes:
- Keep one active `MONGO_URI` line only.
- The database name in the URI (for example `/hospital`) is the single database used by all models.

## Run

```bash
npm install
npm run start
```

## Useful Commands

```bash
npm run dev
npm run db:ping
npm run seed:admin
```

## API Prefixes

- Public auth: `/api/auth/*`
- Protected modules: `/api/patients/*`, `/api/wards/*`, `/api/admissions/*`
