#!/bin/bash
cd -- "$(dirname -- "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo 'Installeer eerst Node.js 24 LTS vanaf https://nodejs.org en open dit bestand opnieuw.'
  read -r -p 'Druk op Enter om te sluiten.'
  exit 1
fi
if [ ! -f node_modules/next/package.json ]; then
  npm ci --no-audit --no-fund || { echo 'Installeren mislukt. Controleer je internetverbinding.'; read -r; exit 1; }
fi
npm run preview
read -r -p 'Druk op Enter om te sluiten.'
