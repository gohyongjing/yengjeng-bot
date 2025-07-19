#!/usr/bin/env bash

set -e

npm run lint:fix-all
npm run format:fix-all
npm run check:all
npm run build
clasp setting scriptId 1hWAK0TQg8aWSGkZiB67qeQFWOpeYdkthHkTxtPvMb2m4YbxiQpH87T_V
clasp push
clasp deploy -i AKfycbzBaidIK7NK4VOtIZGQ5PEK2sTJFaSihGGFYqeSjkukyluuM8ohcbpTOgGo6x-tKVXJyw
