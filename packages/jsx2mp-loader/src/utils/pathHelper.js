const { extname, sep, join } = require('path');

function removeExt(path, platform) {
  const ext = extname(path);
  const extReg = new RegExp(`${platform ? `(.${platform})?` : ''}${ext}$`.replace(/\./g, '\\.'));
  return path.replace(extReg, '');
}

/**
 * judge whether the child dir is part of parent dir
 * @param {string} child
 * @param {string} parent
 */
function isChildOf(child, parent) {
  const childArray = child.split(sep).filter(i => i.length);
  const parentArray = parent.split(sep).filter(i => i.length);
  const clen = childArray.length;
  const plen = parentArray.length;

  let j = 0;
  for (let i = 0; i < plen; i++) {
    if (parentArray[i] === childArray[j]) {
      j++;
    }
    if (j === clen) {
      return true;
    }
  }
  return false;
}


/**
 * Check whether testPath is from targetDir
 *
 * @param {string} testPath
 * @param {string} targetDir
 * @returns {boolean}
 */
function isFromTargetDir(testPath, targetDir) {
  return isChildOf(targetDir, testPath);
}


/**
 * Check whether testPath is from one of the targetDirs
 *
 * @param {string} testPath
 * @returns {Function}
 */
function isFromTargetDirs(targetDirs) {
  return (testPath) => {
    return targetDirs.some(targetDir => isFromTargetDir(testPath, targetDir));
  };
}

/**
 * replace the file's extension with new extension
 *
 * @param {string} filePath
 * @param {string} newExtension eg. .ts .js
 * @returns {string}
 */
function replaceExtension(filePath, newExtension) {
  const lastDot = filePath.lastIndexOf('.');
  return filePath.slice(0, lastDot) + newExtension;
}

/**
 * add double backslashs in case that filePath contains single backslashs
 * @param {string} filePath
 * @returns {string}
 */
function doubleBackslash(filePath) {
  return filePath.replace(/\\/g, '\\\\');
}

/**
 * Use '/' as path sep regardless of OS when outputting the path to code
 * @param {string} filepath
 */
function normalizeOutputFilePath(filepath) {
  return filepath.replace(/\\/g, '/');
}

/**
 * Add ./ at the start of filepath
 * @param {string} filepath
 * @returns {string}
 */
function addRelativePathPrefix(filepath) {
  return filepath[0] !== '.' ? `./${filepath}` : filepath;
}

/**
 *  Some packages like jsx-compiler should be a dependency of jsx2mp-loader. But if the project has installed it, then it will take the priority.
 * @param {string} packageName
 * @param {string} rootDir
 */
function getHighestPriorityPackage(packageName, rootDir) {
  const resolvePaths = require.resolve.paths(packageName);
  resolvePaths.unshift(join(rootDir, 'node_modules'));
  const packagePath = require.resolve(packageName, {
    paths: resolvePaths
  });
  return require.resolve(packagePath);
}

module.exports = {
  removeExt,
  isFromTargetDirs,
  replaceExtension,
  doubleBackslash,
  normalizeOutputFilePath,
  addRelativePathPrefix,
  getHighestPriorityPackage
};
