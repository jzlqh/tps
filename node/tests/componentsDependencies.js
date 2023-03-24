const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf')
const html = `
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <title>componentsDependencies</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.3.2/dist/echarts.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <style>
    #searchBox {
      position: fixed;
      top: 10px; 
      left: 50%;
      transform: translateX(-50%);
      z-index: 1999;
    }
    #main {
      width: 100vw;
      height: 100vh;
    }
  </style>
</head>

<body>
  <section id ="searchBox">
    <input type="text" id="searchVal" />
    <button onclick="search()">search</button>
</section>
  <div id="main"></div>
  <script type="text/javascript">
    let collectData = {}
    const myChart = echarts.init(document.getElementById('main'));
    myChart.showLoading();
    $.get('componentsDependencies.json', function (data) {
      myChart.hideLoading();
      data.children.forEach(function (datum, index) {
        datum.collapsed = true
      });
      collectData = data
      initChart(data) 
      myChart.resize({
        height: data.children.length * 18 
      })  
    });
    function search() {
      const searchVal = $('#searchVal').val()
      const obj = {
        name: 'otcTreeMap',
        children: []
      }
      const collects = new Set()
      collectData.children.forEach(ele => {
        ele.children.forEach(e => {
          if (e.name.includes(searchVal)) {
           collects.add(ele)
          }
        })
      })
      obj.children = [...collects]
      initChart(obj)
      $('#main').css('margin-top', '50px')
      myChart.resize({
        height:  obj.children.length * 18 
      })  
    }
    function initChart(opt) {
      myChart.setOption(
        (option = {
          tooltip: {
            trigger: 'item',
            triggerOn: 'mousemove'
          },
          series: [
            {
              type: 'tree',
              data: [opt],
              top: '1%',
              left: '7%',
              bottom: '1%',
              right: '30%',
              symbolSize: 7,
              label: {
                position: 'left',
                verticalAlign: 'middle',
                align: 'right',
                fontSize: 9
              },
              leaves: {
                label: {
                  position: 'right',
                  verticalAlign: 'middle',
                  align: 'left'
                }
              },
              emphasis: {
                focus: 'descendant'
              },
              expandAndCollapse: true,
              animationDuration: 550,
              animationDurationUpdate: 750
            }
          ]
        })
      );
    }
  </script>
</body>

</html>`
module.exports = class ComponentsDependenciesAnalyzerPlugin {
  constructor(options = {}) {
    this.context = null;
    this.entryList = [];
    this.options = {                                                                                                  // 是否翻转依赖表，（tree 为 true 时，此选项失效）
      relativePath: true, 
      ...options                                             
    }
    this.dependencies = {};
    this.allFileList = new Set();
  }
  skip(filePath) {
    return filePath && filePath.includes('node_modules');
  }
  getEntryList(config) {
    const entry = config.entry;
    if (typeof entry === 'string') {
      return [entry];
    }
    if (Array.isArray(entry)) {
      return [].concat(entry);
    }
    if (typeof entry === 'object') {
      return Object.values(entry);
    }
    return [];
  }
  addDependencies(dependencies, filePath) {
    dependencies = dependencies || [];
    if (filePath && !dependencies.includes(filePath)) {
      dependencies.push(filePath);
    }
    return dependencies;
  }
  conversionFilePath(filePath, conversionRelative) {
    if (!filePath) return filePath;
    const isAbsolute = path.isAbsolute(filePath);
    conversionRelative = typeof conversionRelative === 'undefined' ? this.options.relativePath : conversionRelative;
    if (conversionRelative) {
      return path.relative(this.context, filePath);
    }
    return isAbsolute ? filePath : path.join(this.context, filePath);
  }

  generateDependencies(issuer, requireFile) {
    issuer = this.conversionFilePath(issuer);
    requireFile = this.conversionFilePath(requireFile);
    this.dependencies[issuer] = this.addDependencies(this.dependencies[issuer], requireFile);
    this.allFileList.add(issuer).add(requireFile);
  }

  async outputDependencies(result, callback) {
    rimraf.sync('./componentsCollect')
    if (!fs.existsSync('./componentsCollect')) {
      fs.mkdirSync('./componentsCollect');
  }
    const treeMap = {
      name: 'otcTreeMap',
      children: []
    }
    const childrenSup = [] 
    
    Object.keys(result).forEach((key, index) => { 
      const childrenSub = []
      result[key].forEach((e, i) => {
        childrenSub.push({
          name: e,
          children: []
        })
      })
      if (key === '') {
        key = 'css'
      }
      if (key === 'null') {
        key = 'store'
      }
      childrenSup.push({
        name: key,
        children: childrenSub
      })
    })
    treeMap.children = childrenSup
    fs.writeFileSync('./componentsCollect/componentsCollect.html', html);
    fs.writeFileSync('./componentsCollect/componentsCollect.json', JSON.stringify(result, null, 2));
    fs.writeFileSync('./componentsCollect/componentsDependencies.json', JSON.stringify(treeMap, null, 2));
    callback()
  }

  async afterResolve(result, callback) {
    const issuer = result.resourceResolveData.context.issuer;
    const filePath = result.resourceResolveData.path;
    if (issuer !== filePath && !this.skip(issuer) && !this.skip(filePath)) {
      this.generateDependencies(issuer, filePath);
    }
    callback();
  }

  async handleFinishModules(modules, callback) {
    this.outputDependencies(this.dependencies, callback)
  }

  async apply(compiler) {
    this.context = compiler.options.context;
    this.entryList = this.getEntryList(compiler.options).map(entry => this.conversionFilePath(entry));
    compiler.hooks.normalModuleFactory.tap('ComponentsDependenciesAnalyzerPlugin', nmf => {
      nmf.hooks.afterResolve.tapAsync('ComponentsDependenciesAnalyzerPlugin', this.afterResolve.bind(this));
    });
    compiler.hooks.compilation.tap('ComponentsDependenciesAnalyzerPlugin', compilation => {
      compilation.hooks.finishModules.tapAsync('ComponentsDependenciesAnalyzerPlugin', this.handleFinishModules.bind(this));
    });
  }
};