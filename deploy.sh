#!/bin/bash
# Temporary deployment script

export CI=true
export GH_TOKEN=${AI_MUSIC_GITHUB_TOKEN}

git update-index --refresh
git diff-index --quiet HEAD -- || echo "Uncommitted changes - process aborted" && exit 1

yarn test --coverage
bash <(curl -s https://codecov.io/bash)
npx semantic-release
