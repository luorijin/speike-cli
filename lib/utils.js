const fs = require('fs')
const path = require('path')
const fs_readdir = promisify(fs.readdir, fs)
const fs_rmdir = promisify(fs.rmdir, fs)
const fs_unlink = promisify(fs.unlink, fs)

/*
 * make callback function to promise
 * @param  {Function} fn
 * @param  {Object}   receiver
 * @return {Promise}
 */
function promisify(fn, receiver) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res)
      }])
    })
  }
}

module.exports = {
  /*
   * check path is exist
   * 
   * @param  {String} target path
   * @return {Boolean}
   */
  isExist(target) {
    target = path.normalize(target)

    try {
      fs.accessSync(target)
      return true
    } catch(e) {
      return false
    }
  },

  /*
   * check path is directory
   * @param {String} path
   * @param {Boolean}
   */
  isDirectory(targetPath) {
    const {isExist} = module.exports
    if (!isExist(targetPath)) return false
    return fs.statSync(targetPath).isDirectory()
  },

  /*
   * Remove directory by path
   * @param {String} target path
   */
  rmdir(targetPath) {
    const {isDirectory, rmdir} = module.exports
    if (!isDirectory(targetPath)) return Promise.resolve()

    return fs_readdir(targetPath)
    .then(files => {
      return files.map(item => {
        const filepath = path.join(targetPath, item)
        if (isDirectory(filepath)) {
          return rmdir(filepath)
        } else {
          return fs_unlink(filepath)
        }
      })
    })
    .then(list => Promise.all(list))
    .then(() => fs_rmdir(targetPath))
  },

  promisify,
}