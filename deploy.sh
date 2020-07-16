#!/bin/bash

# Temporary deployment script

export CI=true
export GH_TOKEN=${AI_MUSIC_GITHUB_TOKEN}

npx semantic-release
