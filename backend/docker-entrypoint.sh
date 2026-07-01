#!/bin/sh
set -e

# Create the schema (the seed runner uses synchronize:true) and seed idempotent
# default data. Safe to run on every start — the seed checks for existing rows.
echo "🌱 Running database seed/migration..."
node dist/database/seed-runner.js

echo "🚀 Starting backend..."
exec node dist/main
