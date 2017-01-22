#!/bin/bash

# vars
YADADEMO_HOME=/Users/varonda1/Documents/workspace-git/yadademo
RSRC_DIR=$YADADEMO_HOME/src/main/resources
WEBAPP_SRCDIR=$YADADEMO_HOME/src/main/webapp
WEBAPP_HTMLDIR=$WEBAPP_SRCDIR/html
TOMCAT_HOME=/apps/yada/tomcat
WEBAPP_DEPLOYDIR=$TOMCAT_HOME/webapps/yadademo
BINDIR=/Users/varonda1/Documents/workspace-git/math-extension/src

DEPLOY=0

while getopts d OPT
do
  case $OPT in
  d)
    DEPLOY=1;
    echo "deploying webapp"
    ;;
  esac
done

# YADA index processing


# build templates
hulk $RSRC_DIR/template/*.hogan > $WEBAPP_SRCDIR/templates.js
# convert markdown
rm $WEBAPP_HTMLDIR/*
cd $RSRC_DIR/md
for each in `ls *.md`
do
  FNAME=`echo $each | sed -E 's/^(.+)\.md/\1/'`
  showdown makehtml -e $BINDIR/showdown-math.js -i $each -o $WEBAPP_HTMLDIR/$FNAME.html
done

# deploy webapp
if [ $DEPLOY -eq 1 ]
then
  if [ ! -d "$WEBAPP_DEPLOYDIR" ]
  then
	   mkdir $WEBAPP_DEPLOYDIR
   fi
   cp -rf $WEBAPP_SRCDIR/* $WEBAPP_DEPLOYDIR
fi
