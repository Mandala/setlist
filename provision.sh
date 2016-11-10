#!/bin/bash

## Get latest NodeJS Version
echo "Adding node debian source to box..."
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
echo "Installing nodejs..."
apt-get install -q -y nodejs

## Prepare mocha for test
echo "Installing mocha and istanbul..."
npm install -g -q mocha istanbul

## Prepare directory for test
echo "Installing local dependencies..."
cd /vagrant
npm install -q --only=dev 

## Start test
echo "Starting test suite..."
npm test
