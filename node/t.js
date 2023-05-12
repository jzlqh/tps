const str = 'abc'
console.log(str.at(-1));

const PurgecssPlugin = require('./ourPurgeCss')

const PATHS = {
  src: path.join(__dirname, '../../../', './bybitizens/otc/desktop')
}

new PurgecssPlugin({
  paths: glob.sync(`${PATHS.src}/**/*`, { nodir: true }),
}),

  "purgecss-webpack-plugin": "^4.1.3",
    "purgecss": "^1.4.0",


