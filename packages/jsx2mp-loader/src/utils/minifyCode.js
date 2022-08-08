const terser = require('terser');
const csso = require('csso');
const prettyData = require('pretty-data').pd;
const esbuild = require('esbuild');

const useEsBuildMinify = process.argv.indexOf('--minify-esb') > -1;

function minifyJS(source) {
  if (useEsBuildMinify) {
    return esbuild.transformSync(source, { minify: true, target: 'es6' }).code;
  }
  return terser.minify(source).code;
}

function minifyCSS(source) {
  if (useEsBuildMinify) {
    return esbuild.transformSync(source, { loader: 'css', minify: true }).code;
  }
  return csso.minify(source, {
    restructure: false
  }).css;
}

function minifyXML(source) {
  return prettyData.xmlmin(source);
}

function minifyJSON(source) {
  return prettyData.json(source);
}

function minify(source, type = '.js') {
  if (type === '.js') {
    return minifyJS(source);
  }
  if (type === '.css') {
    return minifyCSS(source);
  }
  if (type === '.json') {
    return minifyJSON(source);
  }
  if (/\..*ml/.test(type)) {
    return minifyXML(source);
  }

  return source;
}

module.exports = {
  minify,
  minifyJS,
  minifyCSS,
  minifyXML,
  minifyJSON
};
