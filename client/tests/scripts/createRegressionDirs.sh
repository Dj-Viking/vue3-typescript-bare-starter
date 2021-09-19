#!/usr/bin/env bash

DIR=$1

echo 'creating new directories for the test' $1
echo 'nested inside the base, actual, and diff fixture directories'

cd tests; 
cd e2e;
cd fixtures;
cd screenshots;
cd actuals; mkdir $1;
cd ..;
cd base; mkdir $1;
cd ..;
cd diff; mkdir $1;
echo 'complete';
echo 'printing new directories'
cd ..;
cd actuals; ls; cd ..;
cd base; ls; cd ..;
cd diff; ls; 