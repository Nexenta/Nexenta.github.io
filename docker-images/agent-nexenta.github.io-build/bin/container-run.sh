#!/usr/bin/env bash

docker run \
    -v /var/run/docker.sock:/var/run/docker.sock \
    --name solutions-team-jenkins-agent-nexenta.github.io-build \
    solutions-team-jenkins-agent-nexenta.github.io-build
