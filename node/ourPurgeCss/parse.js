module.exports = () => {
  const entryPaths = paths => {
    let ret = paths || []

    if (typeof ret === 'function') {
      ret = ret()
    }

    // Convert possible string to an array
    if (typeof ret === 'string') {
      ret = [ret]
    }

    return ret
  }

  const flatten = paths =>
    Array.isArray(paths)
      ? paths
      : Object.keys(paths).reduce((acc, val) => [...acc, ...paths[val]], [])

  const entries = (paths, chunkName) => {
    if (Array.isArray(paths)) {
      return paths
    }

    if (!(chunkName in paths)) {
      return []
    }

    const ret = paths[chunkName]

    return Array.isArray(ret) ? ret : [ret]
  }
  return {
    entryPaths,
    flatten,
    entries,
  }
}