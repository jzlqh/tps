#!/usr/bin/env node
const fs = require("fs");
const shell = require('shelljs')
const exec = require('child_process').exec
const path = require("path");
const list = [];
function listFile(dir) {
  const arr = fs.readdirSync(dir);
  arr.forEach(function (item) {
    const fullpath = path.join(dir, item);

    const stats = fs.statSync(fullpath);
    if (stats.isDirectory()) {
      listFile(fullpath);
    } else {
      const suffix = item.split('.')
      if (suffix.length <= 2 && suffix[suffix.length - 1] === 'less') {
        list.push(fullpath);
      }
      // list.push(fullpath);
    }
  });
  return list;
}

const res = listFile('/Users/sh00122ml/work/marvel-fiat/src/bybitizens/otc/desktop');
function compileFile(res) {
  res.forEach(item => {
    const filePath = item.split('.')[0]
    shell.exec(`lessc ${item} > ${filePath}.css`, {
    })
  })
}
compileFile(res)
