#!/usr/bin/env bash
# Force use of npm instead of bun (default)

echo "🛠 Forcing npm install to avoid bun issues"
npm install
npm run build
