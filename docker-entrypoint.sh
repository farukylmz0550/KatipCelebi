#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if seed is needed..."
SEED_NEEDED=$(node -e "
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = (process.env.DATABASE_URL || 'file:./prisma/dev.db').replace(/^file:/, '').replace(/^\"|\"$/g, '');
const db = new Database(dbPath);
const count = db.prepare('SELECT COUNT(*) as c FROM Achievement').get();
console.log(count.c === 0 ? 'yes' : 'no');
db.close();
" 2>/dev/null || echo "yes")

if [ "$SEED_NEEDED" = "yes" ]; then
  echo "Seeding achievements..."
  npm run db:seed
else
  echo "Achievements already seeded, skipping."
fi

echo "Starting server..."
exec node server.js
