#!/usr/bin/env bash

set -e

npm run fix:all
npm run build
clasp setting scriptId 1Fllmu_r4E62F6eNmyVMxJl02w73idMPkPwVzykwZfoFvorpOKAJprUWU
clasp push
clasp deploy -i AKfycbxLhddkuw6y5WvMQuk_T7nJUGtOGzLzjFA2k1Kp9Ny7nhhlCJLLiCMM20HECV15jmzZVA
