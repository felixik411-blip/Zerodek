-- Zerodek security scanner — PostgreSQL DDL (what Prisma generates, spelled out).
-- Run: psql "$DATABASE_URL" -f scripts/postgres-schema.sql
-- Requires PG 13+ (gen_random_uuid is built in since 13).

CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- Enumerated domains: the engine can never store an unexpected state.
CREATE TYPE user_role    AS ENUM ('admin', 'user');
CREATE TYPE threat_kind  AS ENUM ('file', 'url');
CREATE TYPE scan_kind    AS ENUM ('file', 'link');
CREATE TYPE verdict      AS ENUM ('clean', 'suspicious', 'malicious');
CREATE TYPE severity     AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_kind   AS ENUM ('malware', 'intrusion', 'critical', 'system');
CREATE TYPE alert_status AS ENUM ('open', 'resolved');
CREATE TYPE item_kind    AS ENUM ('file', 'link');
CREATE TYPE item_status  AS ENUM ('threat_found', 'suspicious');
CREATE TYPE risk_level   AS ENUM ('low', 'medium', 'high');

CREATE TABLE "User" (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         varchar(255) NOT NULL UNIQUE,
  name          varchar(120),
  password_hash varchar(255) NOT NULL,          -- scrypt "salt:hash" hex
  role          user_role   NOT NULL DEFAULT 'user',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Threat" (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature   varchar(512) NOT NULL UNIQUE,     -- sha256 (file) or hostname (url)
  kind        threat_kind NOT NULL DEFAULT 'file',
  name        varchar(160) NOT NULL,
  severity    severity    NOT NULL DEFAULT 'medium',
  description text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "Scan" (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES "User"(id) ON DELETE SET NULL,
  kind       scan_kind   NOT NULL,
  target     varchar(2048) NOT NULL,           -- file name or checked URL
  sha256     char(64),                          -- exactly 64 hex chars, or NULL for links
  size       bigint,                            -- bytes (int4 would overflow >2 GB)
  verdict    verdict     NOT NULL,
  severity   severity,
  reasons    jsonb,                             -- queryable signal list
  engine     varchar(60) NOT NULL DEFAULT 'heuristic-v1',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- The three access patterns every endpoint uses:
CREATE INDEX scan_created_at_idx    ON "Scan" (created_at DESC);          -- history feed
CREATE INDEX scan_kind_verdict_idx  ON "Scan" (kind, verdict);            -- links checked / threats blocked
CREATE INDEX scan_verdict_time_idx  ON "Scan" (verdict, created_at DESC); -- stats: severity index, health

CREATE TABLE "Alert" (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind       alert_kind  NOT NULL,
  severity   severity    NOT NULL DEFAULT 'medium',
  message    varchar(500) NOT NULL,
  status     alert_status NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX alert_created_idx      ON "Alert" (created_at DESC);
CREATE INDEX alert_kind_created_idx ON "Alert" (kind, created_at DESC);

CREATE TABLE "QuarantineItem" (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar(255) NOT NULL,
  kind       item_kind   NOT NULL DEFAULT 'file',
  reason     varchar(500) NOT NULL,
  status     item_status NOT NULL DEFAULT 'threat_found',
  size_label varchar(32),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE "PermissionAudit" (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app        varchar(160) NOT NULL,
  permission varchar(80)  NOT NULL,
  risk       risk_level  NOT NULL DEFAULT 'medium',
  advice     varchar(400),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Convenience view for the welcome band's numbers (one row, always fresh).
CREATE OR REPLACE VIEW stats_overview AS
SELECT
  (SELECT count(*) FROM "Scan")                                        AS scans_completed,
  (SELECT count(*) FROM "Scan" WHERE verdict = 'malicious')            AS threats_blocked,
  (SELECT count(*) FROM "Scan" WHERE kind = 'link')                    AS links_checked,
  (SELECT count(*) FROM "Scan" WHERE created_at >= date_trunc('day', now())) AS scans_today;
