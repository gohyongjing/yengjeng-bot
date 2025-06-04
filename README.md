# 🤖 Yeng Jeng Bot

[![Build Status](https://app.travis-ci.com/gohyongjing/yengjeng-bot.svg?token=an5nSQAaSPsPVFnHBkha&branch=main)](https://app.travis-ci.com/gohyongjing/yengjeng-bot)
[![codecov](https://codecov.io/github/gohyongjing/yengjeng-bot/graph/badge.svg?token=WXAVCO164F)](https://codecov.io/github/gohyongjing/yengjeng-bot)

Yeng Jeng Bot helps you retrieve bus arrival timings at a bus stop

## ❓ Getting started

Talk to [Yeng Jeng Bot](https://t.me/yengjengbot) on telegram!

### 👋 `/start`

Initialises the bot

### 🚍 `/bus <bus_stop_no>`

Retrieves bus arrival timings for the bus stop of the specified id

### ❔ `/help`

Shows all the commands that can be used

### ℹ️ `/version`

Shows the version number of Yeng Jeng bot

## Development

### Set up

1. Install dependencies
   ```
   npm install
   ```
1. Add in environment variables to .env

### Deploy

1. Log in to clasp, and give all required permissions
   ```
   npx clasp login
   ```
1. Deploy
   ```
   npm run deploy:dev
   ```
