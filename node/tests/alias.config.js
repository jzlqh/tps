const { resolveRoot } = require('./utils');

module.exports = {
  fiat: {
    desktop: {
      '@babel/runtime': resolveRoot('node_modules/@babel/runtime'),
      'by-helpers': resolveRoot('node_modules/by-helpers'),
      'by-shared-settings': resolveRoot('node_modules/by-shared-settings'),
      // 'rc-util': resolveRoot('node_modules/rc-util'),
    },
  }
}
