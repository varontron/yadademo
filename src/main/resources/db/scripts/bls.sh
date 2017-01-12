#!/bin/bash

YADADEMO_HOME=/Users/varonda1/Documents/workspace-git/yadademo
DB_HOME=$YADADEMO_HOME/src/main/resources/db

URL=https://download.bls.gov/pub/time.series/ap/ap.data.2.Gasoline
AREA_CODE=A103  #boston et al
ITEM_CODE=74714 #gas, unleaded, regular

# regex good until 12/31/2019
REGEX="$AREA_CODE$ITEM_CODE\s+201[1-9]\s+.*"

OUTPUT=$DB_HOME/bls.csv

curl -qs "$URL" | grep -E $REGEX > $OUTPUT
