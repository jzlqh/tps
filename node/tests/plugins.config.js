// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path')
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");
// const CircularDependencyPlugin = require('circular-dependency-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const FontPreloadPlugin = require("webpack-font-preload-plugin");
const ComponentsDependencies = require('./componentsDependencies')
const ComponentsCount = require('./componentsCount')
const UselessFile = require('useless-files-webpack-plugin');
const WebpackUnusedScaner = require('./unUsedPlugin');

// const { resolveRoot } = require('./utils');

module.exports = {
  otc: {
    desktop: [
      // new UselessFile({
      //   root: './src/bybitizens/otc/desktop', // 项目目录
      //   out: './fileList.json', // 输出文件列表
      //   // out: (files) => deal(files), // 或者回调处理
      //   clean: false, // 删除文件,
      //   exclude: path // 排除文件列表, 格式为文件路径数组
      // }),

      // new WebpackUnusedScaner({
      //   directories: './src/bybitizens/otc/desktop',
      //   // Exclude patterns
      //   // Root directory (optional)
      //   root: __dirname,
      //   // Remove files (optional)
      //   remove: false,
      // })

      // new ComponentsCount(),
      // new ComponentsDependencies()
    ]
  },
  fiat: {
    desktop: [
      new FontPreloadPlugin({
        extensions: ['woff2'],
        insertBefore: "body > link",
      }),
    ].concat(
      process.env.NODE_ENV === 'production' ? [
        // new MiniCssExtractPlugin({
        //   // Options similar to the same options in webpackOptions.output
        //   // both options are optional
        //   filename: 'static/css/[name].[contenthash:8].css',
        //   chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
        //   ignoreOrder: true,
        // }),
      ] : [

        new DuplicatePackageCheckerPlugin({
          // 显示需要重复依赖包的模块（默认值：false）
          verbose: true,
          // 发出错误而不是警告(默认值：false)
          // emitError: true,
          // 如果发现重复的依赖包则展示帮助信息(默认值：true)
          // showHelp: false,
          // 如果主要版本不同，也会发出警告 (默认值：true)
          // strict: false,
          /**
           * 从结果中排除依赖包的实例。
           * 如果一个包的所有实例都被排除，或者除了一个实例之外的所有实例都被排除，那么这个包就不再被认为是重复的，并且不会发出警告/错误。
           * @param {Object} instance
           * @param {string} instance.name 依赖包名称
           * @param {string} instance.version 依赖包版本
           * @param {string} instance.path 依赖包的绝对路径
           * @param {?string} instance.issuer 请求依赖包的模块的绝对路径
           * @returns {boolean} true 表示排除该实例，否则为false
           */
          exclude(instance) {
            return ['@babel/runtime', 'rc-util', 'rc-resize-observer'].includes(instance.name);
          }
        }),
        // new CircularDependencyPlugin({
        //   // exclude detection of files based on a RegExp
        //   exclude: /node_modules/,
        //   // include specific files based on a RegExp
        //   // include: /dir/,
        //   // add errors to webpack instead of warnings
        //   failOnError: true,
        //   // allow import cycles that include an asynchronous import,
        //   // e.g. via import(/* webpackMode: "weak" */ './file.js')
        //   allowAsyncCycles: false,
        //   // set the current working directory for displaying module paths
        //   cwd: resolveRoot(),
        // }),
        new HardSourceWebpackPlugin(),
      ]
    ),
  }
}
