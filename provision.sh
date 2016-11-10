#!/usr/bin/env bash

## Configuration
NODE_VER=4.4.7
NODE_URL="https://nodejs.org/download/release/v$NODE_VER/node-v$NODE_VER-linux-x64.tar.gz"
NODE_DIR="node-v$NODE_VER-linux-x64"
DEST_DIR="/usr"

## Update and upgrade repos
#apt-get update
#apt-get upgrade -y

## Download specific NodeJS version
cd ~
wget $NODE_URL -q -O nodepkg.tar.gz
## Unzip tar file
tar -xzf nodepkg.tar.gz
## Copy binary files
cd $NODE_DIR
cp -r bin/ $DEST_DIR
cp -r include/ $DEST_DIR
cp -r lib/ $DEST_DIR
cp -r share/ $DEST_DIR

## Prepare for test
npm install -g -q mocha
