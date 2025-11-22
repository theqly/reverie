#!/usr/bin/env bash

rm -rf schemas/*.graphql

cat ../../backend/profile-service/graph/schema/*.graphqls > schemas/profile.graphql
cat ../../backend/content-service/graph/schema/*.graphqls > schemas/content.graphql
cat ../../backend/feed-service/graph/schema/*.graphqls > schemas/feed.graphql