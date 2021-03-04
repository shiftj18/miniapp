const { createMiniComponents, modifyInternalComponents, buildBaseTemplate, buildChildrenTemplate, buildComponentTemplate } = require('./baseTemplate');

const platformConfig = require('../../platforms');

const BASE_LEVEL = 16;

/**
 * Build each floor of component template
 * @param {number} level - recursion level
 * @param {string} target
 * @param {Object} compSet - special component sets
 */
function buildFloor(level, target, compSet) {
  const { nestElements, miniComponents, derivedComponents } = compSet;
  const components = Object.keys(miniComponents);

  let template = components.reduce((current, nodeName) => {
    const nodeActualName = derivedComponents.get(nodeName) || nodeName;
    if (level !== 0) {
      if (!nestElements.has(nodeActualName)) {
        return current;
      } else {
        const max = nestElements.get(nodeName);
        if (max > 0 && level >= max) {
          return current;
        }
      }
    }
    const nodeAttributes = miniComponents[nodeName];
    return current + buildComponentTemplate({ nodeName, nodeActualName, nodeAttributes }, level, target, { isRecursiveTemplate: false });
  }, '');

  return template;
}

/**
 * Build unrecursive template
 * @param {string} target
 * @param {Object} customComponentsConfig - Configed by developer using build script plugin
 */
function buildUnrecursiveTemplate(target, customComponentsConfig) {
  const { internalComponents, derivedComponents, nestElements, sjs, adapter } = platformConfig[target];

  const customInternalComponents = modifyInternalComponents(internalComponents, customComponentsConfig);
  const miniComponents = createMiniComponents(customInternalComponents, adapter);

  let template = buildBaseTemplate(sjs, { isRecursiveTemplate: false });
  for (let i = 0; i < BASE_LEVEL; i++) {
    template += buildChildrenTemplate(i, adapter, { isRecursiveTemplate: false, restart: false });
    template += buildFloor(i, target, {
      miniComponents, derivedComponents, nestElements
    });
  }
  template += buildChildrenTemplate(BASE_LEVEL, adapter, { isRecursiveTemplate: false, restart: true });

  return template;
}

/**
 * Build recursive template sjs
 * @param {string} target
 */
function buildUnrecursiveTemplateSjs(target) {
  const { sjs: { exportExpression }} = platformConfig[target];
  return `${exportExpression} {
      a: function(v, dv) {
        return v === undefined ? dv : v;
      },
      b: function(r, prefix) {
        var s = r['focus-state'] !== undefined ? 'focus' : 'blur';
        return prefix + r.nodeType + '_' + s
      },
      c: function(level) {
        return 'RAX_TMPL_CHILDREN_' + level;
      },
      d: function(nodeType, chains) {
        if (!nodeType) nodeType = 'h-element';
        var items = chains.split(',');
        var level = 0;

        for (var i = 0; i < items.length; i++) {
          if (nodeType === items[i]) {
            level = level + 1;
          }
        }
        var templateName = 'RAX_TMPL_' + level + '_' + nodeType;
        return templateName;
      },
      e: function(nodeType, chains) {
        return chains + ',' + nodeType;
      }
}`;
}

module.exports = {
  buildUnrecursiveTemplate,
  buildUnrecursiveTemplateSjs
};
