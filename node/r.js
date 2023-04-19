const fs = require("fs");
const shell = require('shelljs')
const exec = require('child_process').exec
const path = require("path");
const babylon = require('@babel/parser')
const traverse = require("@babel/traverse").default
const generate = require("@babel/generator").default
const t = require('@babel/types')
const list = [];

const parses = (item) => {
  const codes = fs.readFileSync(item)
  const codeStr = codes.toString('utf-8')
  const Ast = babylon.parse(codeStr, {
    sourceType: "module",
    plugins: ['jsx', 'decorators-legacy', 'typescript'],
  })
  // const Ast = require("@babel/core").transformSync(codeStr, {
  //   plugins: ["@babel/plugin-syntax-jsx"],
  // });
  // console.log('Ast', Ast);
  traverse(Ast, {
    enter(path) {
      if (path.node.type === 'ImportDeclaration' && path.node.source.value.startsWith('./')) {
        const t = path.node.source.value.slice(2).split('.')
        if ((t.length <= 2) && (t[t.length - 1] === 'less')) {
          path.node.source.value = `./${t[0]}.css`
          console.log('path.node.source.value', path.node.source.value);
        }

      }
    }
  })

  const result = generate(Ast, {
    retainLines: true,
    compact: "auto",
    concise: false,
    quotes: "double",
  }, codes)
  fs.writeFileSync(item, result.code)
}

function listFile(dir) {
  const arr = fs.readdirSync(dir);
  arr.forEach(function (item) {
    const fullpath = path.join(dir, item);

    const stats = fs.statSync(fullpath);
    if (stats.isDirectory()) {
      listFile(fullpath);
    } else {
      const suffix = item.split('.')
      if (suffix.length <= 2 && suffix[suffix.length - 1] === 'jsx') {
        list.push(fullpath);
      }
    }
  });
  return list;
}

const res = listFile('/Users/sh00122ml/work/marvel-fiat/src/bybitizens/otc/desktop');

function compileFile(res) {
  res.forEach(ele => {
    parses(ele)
  })
}
compileFile(res)

