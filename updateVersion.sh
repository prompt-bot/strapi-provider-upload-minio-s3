#!/bin/sh

nextReleaseVersion=$1
if [ -f "package.json" ];then
  curVersion=$(cat package.json | grep "\"version\"" |  awk '{print $2}' | sed 's/"//g' | sed 's/,//g')
  cat package.json | sed "s#$curVersion#$nextReleaseVersion#" >  /tmp/temp
  mv /tmp/temp package.json
fi
