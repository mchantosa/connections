#!/bin/bash
dropdb connections 2>/dev/null
createdb connections
psql -d connections < ../../schema.sql