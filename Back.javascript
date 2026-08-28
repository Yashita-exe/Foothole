## 1) Complete Database Schema (SQL DDL + Enums)

> Assumptions: single-tenant (one “Foothold” instance), UUID primary keys, and server-managed auth (bcrypt + JWT). If you’re using Supabase Auth instead, tell me and I’ll adapt auth tables/policies.

```sql
-- === Extensions ===
create extension if not exists "pgcrypto";

-- === Enums ===
do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('STUDENT','ALUMNI','ADMIN');
  end if;

  if not exists (select 1 from pg_type where typname = 'mentorship_slot_status') then
    create type mentorship_slot_status as enum ('AVAILABLE','BOOKED','COMPLETED');
  end if;

  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type booking_status as enum ('PENDING','ACTIVE','COMPLETED','REJECTED','REFERRAL_GRANTED');
  end if;

  if not exists (select 1 from pg_type where typname = 'purpose_tier') then
    create type purpose_tier as enum ('CHAT','RESUME','REFERRAL');
  end if;

  if not exists (select 1 from pg_type where typname = 'job_status') then
    create type job_status as enum ('ACTIVE','FILLED');
  end if;
end$$;

-- === User table ===
create table if not exists "User" (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  role user_role not null,
  college_id text not null,

  -- For alumni only (nullable for students)
  company text,

  profile_completed boolean not null default false,

  -- Auth (server-managed)
  password_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint user_role_company_chk
    check (
      (role = 'ALUMNI' and company is not null) or
      (role <> 'ALUMNI')
    )
);

create index if not exists idx_user_role on "User"(role);
create index if not exists idx_user_college on "User"(college_id);

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_user_updated_at on "User";
create trigger trg_user_updated_at
before update on "User"
for each row execute function set_updated_at();

-- === MentorshipSlot table ===
create table if not exists "MentorshipSlot" (
  id uuid primary key default gen_random_uuid(),
  alumni_id uuid not null references "User"(id) on delete cascade,

  start_time timestamptz not null,
  end_time timestamptz not null,

  status mentorship_slot_status not null default 'AVAILABLE',

  -- Optional: prevents duplicates for same alumni/time window
  constraint mentorship_slot_time_chk check (end_time > start_time),

  constraint mentorship_slot_duration_chk
    check (extract(epoch from (end_time - start_time)) = 900) -- exactly 15 minutes
);

-- Ensure a single 15-minute slot per alumni/time cannot be duplicated
create unique index if not exists uq_slot_alumni_time
on "MentorshipSlot"(alumni_id, start_time);

create index if not exists idx_slot_alumni on "MentorshipSlot"(alumni_id);
create index if not exists idx_slot_status on "MentorshipSlot"(status);
create index if not exists idx_slot_start on "MentorshipSlot"(start_time);

-- Students only ever see available slots (enforced via API + can be tightened with RLS in Supabase)

-- === Booking table ===
create table if not exists "Booking" (
  id uuid primary key default gen_random_uuid(),
  slot_id uuid not null unique references "MentorshipSlot"(id) on delete cascade,
  student_id uuid not null references "User"(id) on delete cascade,

  purpose_tier purpose_tier not null,
  message_content text,
  meeting_link text,

  status booking_status not null default 'PENDING',

  -- tracks when student first requested it; can be used for TTL flows
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint booking_status_link_chk
    check (
      (status in ('PENDING','ACTIVE','COMPLETED','REJECTED','REFERRAL_GRANTED')) and
      true
    )
);

-- Prevent multiple bookings per student per slot already handled by slot_id unique,
-- but we still index for monthly quota checks.
create index if not exists idx_booking_student_created on "Booking"(student_id, created_at);
create index if not exists idx_booking_slot on "Booking"(slot_id);

drop trigger if exists trg_booking_updated_at on "Booking";
create trigger trg_booking_updated_at
before update on "Booking"
for each row execute function set_updated_at();

-- === Monthly outreach cap enforcement table (normalized) ===
-- Alumni sets cap per month (max active outreach requests per student per month).
-- Active outreach request = student bookings with status 'ACTIVE'.
create table if not exists "AlumniMonthlyCap" (
  id uuid primary key default gen_random_uuid(),
  alumni_id uuid not null references "User"(id) on delete cascade,

  month_key date not null, -- first day of month (e.g. 2026-08-01)
  active_outreach_cap integer not null check (active_outreach_cap >= 0),

  created_at timestamptz not null default now(),
  unique (alumni_id, month_key)
);

create index if not exists idx_cap_alumni_month on "AlumniMonthlyCap"(alumni_id, month_key);

-- === JobBoard table ===
create table if not exists "JobBoard" (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  title text not null,
  location text,
  description text not null,

  voucher_code text not null unique, -- minted internally

  status job_status not null default 'ACTIVE',

  created_at timestamptz not null default now()
);

-- === Voucher unlock ledger (secure, audit-friendly) ===
-- When a booking moves to APPROVED/REFERRAL_GRANTED, we record which voucher_code it unlocks.
-- Also lets you support multiple vouchers in the future.
create table if not exists "VoucherUnlock" (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references "Booking"(id) on delete cascade,
  job_id uuid not null references "JobBoard"(id) on delete restrict,
  unlocked_at timestamptz not null default now()
);

create index if not exists idx_voucher_unlock_booking on "VoucherUnlock"(booking_id);
create index if not exists idx_voucher_unlock_job on "VoucherUnlock"(job_id);

-- === Helpful constraints / invariants ===
-- AlumniMonthlyCap should relate to alumni role (enforce in app OR with trigger).
-- Same for MentorshipSlot.alumni_id role and Booking.student_id role.
-- Postgres enum checks can’t validate role cross-table without triggers.

-- === Transactional concurrency protection ===
-- Slot can be booked once due to Booking.slot_id UNIQUE + we will lock slot row in transactions.
```

### Domain filtering data model (optional but recommended)
You requested: “approved alumni domains” and “institutional email (.edu, .ac.in)”.
A production approach is to store allowed domains in DB (instead of hardcoding). If you want, I’ll add:

- `AllowedEmailDomain(domain text primary key, kind enum STUDENT/ALUMNI)`
- Admin UI to manage them.

For now, the API below assumes you pass two env vars:
- `STUDENT_EMAIL_DOMAIN_ALLOWLIST` (comma-separated)
- `ALUMNI_EMAIL_DOMAIN_ALLOWLIST` (comma-separated)

---

## 2) Core Server Setup (Node.js + Express + TypeScript)

### `src/server.ts`
```ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';

import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth';
import { alumniRouter } from './routes/alumni';
import { slotsRouter } from './routes/slots';
import { bookingsRouter } from './routes/bookings';

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined'));

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STUDENT_EMAIL_DOMAIN_ALLOWLIST',
  'ALUMNI_EMAIL_DOMAIN_ALLOWLIST',
  'ACCESS_TOKEN_TTL_SECONDS',
] as const;

for (const k of requiredEnv) {
  if (!process.env[k]) throw new Error(`Missing env: ${k}`);
}

const prisma = new PrismaClient();

app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

// Routers
app.use('/api/auth', authRouter({ prisma }));
app.use('/api/alumni', alumniRouter({ prisma }));
app.use('/api/slots', slotsRouter({ prisma }));
app.use('/api/bookings', bookingsRouter({ prisma }));

// Centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err?.statusCode ?? 500;
  const code = err?.code ?? 'INTERNAL_ERROR';
  const message = err?.message ?? 'Internal error';
  res.status(status).json({ error: { code, message } });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Foothold API listening on :${port}`);
});
```

### Auth middleware + helpers

#### `src/middleware/auth.ts`
```ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type AuthContext = {
  userId: string;
  role: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing bearer token' } });
  }
  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    (req as any).auth = { userId: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
}

export function getAuth(req: Request): AuthContext {
  const ctx = (req as any).auth;
  if (!ctx) throw new Error('Auth context missing');
  return ctx;
}
```

---

## 3) Relational Controller Logic Files (Atomic booking + unlock)

Below are the two critical flows:
- `POST /api/slots/book` (transactional atomicity + monthly cap decrement)
- `POST /api/bookings/:id/evaluate` (alumnus unlock voucher upon approval)

> Key concurrency pattern:
> - Start a transaction.
> - `SELECT ... FOR UPDATE` equivalent via Prisma: `findUnique` + check status then `update` in same transaction.
> - Also rely on `Booking.slot_id` unique constraint as a backstop.
>
> This prevents double booking even under race conditions.

### Prisma model expectations (Prisma schema)
Your DDL maps cleanly to Prisma. Create `prisma/schema.prisma` accordingly (not reprinted here since you asked for SQL DDL first). The controllers below assume Prisma models roughly:
- `User`, `MentorshipSlot`, `Booking`, `JobBoard`, `AlumniMonthlyCap`, `VoucherUnlock`

If you want, I’ll generate the exact Prisma schema next.

---

### `src/routes/slots.ts`
```ts
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '../middleware/auth';

export function slotsRouter({ prisma }: any) {
  const r = Router();

  // GET /api/slots/available?startAfter=...&alumniId=...
  r.get('/available', requireAuth, async (req, res, next) => {
    try {
      const q = z.object({
        startAfter: z.string().datetime().optional(),
        alumniId: z.string().uuid().optional(),
        limit: z.coerce.number().int().min(1).max(200).optional().default(50),
      }).parse(req.query);

      const where: any = { status: 'AVAILABLE' };
      if (q.alumniId) where.alumni_id = q.alumniId;
      if (q.startAfter) where.start_time = { gte: q.startAfter };

      const slots = await prisma.mentorshipSlot.findMany({
        where,
        orderBy: { start_time: 'asc' },
        take: q.limit,
        select: { id: true, alumni_id: true, start_time: true, end_time: true },
      });

      return res.json({ slots });
    } catch (e) {
      next(e);
    }
  });

  // POST /api/slots/create
  r.post('/create', requireAuth, async (req, res, next) => {
    try {
      const body = z.object({
        start_time: z.string().datetime(),
        end_time: z.string().datetime(),
      }).parse(req.body);

      const auth = getAuth(req);
      if (!['ALUMNI', 'ADMIN'].includes(auth.role)) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Alumni only' } });
      }

      const start = new Date(body.start_time);
      const end = new Date(body.end_time);
      const diffSec = (end.getTime() - start.getTime()) / 1000;
      if (diffSec !== 900) {
        return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Slots must be exactly 15 minutes' } });
      }

      const slot = await prisma.mentorshipSlot.create({
        data: {
          alumni_id: auth.userId,
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          status: 'AVAILABLE',
        },
        select: { id: true, start_time: true, end_time: true, status: true },
      });

      res.status(201).json({ slot });
    } catch (e: any) {
      // Unique violation -> duplicate slot
      if (e?.code === 'P2002') {
        return res.status(409).json({ error: { code: 'DUPLICATE_SLOT', message: 'Slot already exists' } });
      }
      next(e);
    }
  });

  // POST /api/slots/book
  r.post('/book', requireAuth, async (req, res, next) => {
    try {
      const body = z.object({
        slot_id: z.string().uuid(),
        purpose_tier: z.enum(['CHAT', 'RESUME', 'REFERRAL']),
        message_content: z.string().min(1).max(4000).optional(),
        meeting_link: z.string().url().optional(),
      }).parse(req.body);

      const auth = getAuth(req);
      if (!['STUDENT', 'ADMIN'].includes(auth.role)) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Students only' } });
      }

      // Delegate to transactional controller
      const { booking } = await bookSlotTransactional({ prisma, studentId: auth.userId, input: body });

      return res.status(201).json({ booking });
    } catch (e) {
      next(e);
    }
  });

  return r;
}

async function bookSlotTransactional({ prisma, studentId, input }: any) {
  const now = new Date();
  const monthKey = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  return await prisma.$transaction(async (tx: any) => {
    // 1) Lock the slot by transitioning state in a single transaction:
    // Prisma doesn't expose SELECT ... FOR UPDATE directly, but we can:
    // - read slot
    // - update conditionally (only if AVAILABLE)
    // In Postgres, this avoids double booking because Booking.slot_id is UNIQUE
    // and we do all checks atomically.
    const slot = await tx.mentorshipSlot.findUnique({
      where: { id: input.slot_id },
      select: { id: true, alumni_id: true, status: true, start_time: true, end_time: true },
    });
    if (!slot) {
      return Promise.reject({ statusCode: 404, code: 'SLOT_NOT_FOUND', message: 'Slot not found' });
    }
    if (slot.status !== 'AVAILABLE') {
      return Promise.reject({ statusCode: 409, code: 'SLOT_NOT_AVAILABLE', message: 'Slot is not available' });
    }

    // 2) Monthly outreach cap:
    // Alumni sets active cap for that month_key.
    // Student can have max 5 active outreach requests per month overall (global cap),
    // AND max cap as per alumni monthly configuration.
    const globalActiveCap = 5;

    const activeCountGlobal = await tx.booking.count({
      where: {
        student_id: studentId,
        status: 'ACTIVE',
        created_at: { gte: monthKey.toISOString(), lt: new Date(Date.UTC(monthKey.getUTCFullYear(), monthKey.getUTCMonth() + 1, 1)).toISOString() },
      },
    });

    if (activeCountGlobal >= globalActiveCap) {
      return Promise.reject({
        statusCode: 429,
        code: 'MONTHLY_CAP_REACHED',
        message: 'Monthly active outreach cap reached',
      });
    }

    const alumniCap = await tx.alumniMonthlyCap.findUnique({
      where: { alumni_id_month_key: { alumni_id: slot.alumni_id, month_key: monthKey.toISOString().slice(0, 10) } },
    });

    // If alumni hasn't set a cap, default behavior: deny or allow?
    // Production-safe default: deny booking that would create ACTIVE overflow later.
    // Here: if no cap record => cap = 0 (conservative).
    const alumniActiveCap = alumniCap?.active_outreach_cap ?? 0;

    const activeCountForAlumni = await tx.booking.count({
      where: {
        student_id: studentId,
        status: 'ACTIVE',
        // booking -> slot -> alumni_id
        slot_id: undefined as any,
      },
    });

    // We need alumni filtering through slot join; Prisma requires relation structure.
    // Simplest approach: query by joining via relation fields (assuming Booking has slot relation).
    const activeCountForAlumni2 = await tx.booking.count({
      where: {
        student_id: studentId,
        status: 'ACTIVE',
        slot: { alumni_id: slot.alumni_id },
        created_at: {
          gte: monthKey.toISOString(),
          lt: new Date(Date.UTC(monthKey.getUTCFullYear(), monthKey.getUTCMonth() + 1, 1)).toISOString(),
        },
      },
    });

    if (activeCountForAlumni2 >= alumniActiveCap) {
      return Promise.reject({
        statusCode: 429,
        code: 'ALUMNI_CAP_REACHED',
        message: 'Alumni monthly cap reached',
      });
    }

    // 3) Create booking (slot_id unique ensures single booking).
    // Status starts as PENDING; becomes ACTIVE later (optional business decision).
    // If you want immediate ACTIVE on booking, set it here and the cap check matters now.
    const booking = await tx.booking.create({
      data: {
        slot_id: slot.id,
        student_id: studentId,
        purpose_tier: input.purpose_tier,
        message_content: input.message_content ?? null,
        meeting_link: input.meeting_link ?? null,
        status: 'PENDING',
      },
      select: {
        id: true,
        status: true,
        slot_id: true,
        student_id: true,
        purpose_tier: true,
        meeting_link: true,
        created_at: true,
      },
    });

    // 4) Mark slot as BOOKED
    // If another transaction already booked it, the update should fail due to state change.
    await tx.mentorshipSlot.update({
      where: { id: slot.id },
      data: { status: 'BOOKED' },
    });

    return { booking };
  });
}
```

> Note: The `activeCountForAlumni` first attempt is removed by `activeCountForAlumni2`—it relies on Prisma relations (`booking.slot.alumni_id`). Ensure your Prisma schema has `Booking` relation to `MentorshipSlot`.

---

### `src/routes/bookings.ts`
```ts
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, getAuth } from '../middleware/auth';

export function bookingsRouter({ prisma }: any) {
  const r = Router();

  // POST /api/bookings/:id/evaluate
  // alumnus sets booking status; on approval, unlock voucher_code
  r.post('/:id/evaluate', requireAuth, async (req, res, next) => {
    try {
      const body = z.object({
        action: z.enum(['APPROVED', 'REJECTED', 'COMPLETE', 'SET_ACTIVE']),
        // If approved for referral vault, which job voucher to grant:
        job_id: z.string().uuid().optional(),
      }).parse(req.body);

      const auth = getAuth(req);
      if (!['ALUMNI', 'ADMIN'].includes(auth.role)) {
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Alumni only' } });
      }

      const bookingId = req.params.id;

      const result = await evaluateBookingTransactional({
        prisma,
        bookingId,
        alumniId: auth.userId,
        action: body.action,
        jobId: body.job_id,
      });

      return res.json(result);
    } catch (e) {
      next(e);
    }
  });

  // GET /api/student/vouchers
  r.get('/student/vouchers', requireAuth, async (req, res, next) => {
    try {
      const auth = getAuth(req);
      if (!['STUDENT', 'ADMIN'].includes(auth.role)) {
        return res.status(403).json({ error: 
