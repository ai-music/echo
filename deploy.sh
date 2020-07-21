#!/bin/bash

set -e

# Temporary deployment script

export CI=true
export GH_TOKEN=${AI_MUSIC_GITHUB_TOKEN}

require_clean_work_tree () {
    # Update the index
    git update-index -q --ignore-submodules --refresh
    err=0

    # Disallow unstaged changes in the working tree
    if ! git diff-files --quiet --ignore-submodules --
    then
        echo >&2 "cannot deploy: you have unstaged changes."
        git diff-files --name-status -r --ignore-submodules -- >&2
        err=1
    fi

    # Disallow uncommitted changes in the index
    if ! git diff-index --cached --quiet HEAD --ignore-submodules --
    then
        echo >&2 "cannot $1: your index contains uncommitted changes."
        git diff-index --cached --name-status -r --ignore-submodules HEAD -- >&2
        err=1
    fi

    if [ $err = 1 ]
    then
        echo >&2 "Please commit or stash them."
        exit 1
    fi
}

require_clean_work_tree "$@"

yarn test --coverage

if  [[ $1 == "integration" ]] ; then
  docker-compose -f ./integration/test.yml build
  docker-compose -f ./integration/test.yml up --abort-on-container-exit --exit-code-from tests tests
fi

bash <(curl -s https://codecov.io/bash)
npx semantic-release

