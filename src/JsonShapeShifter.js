// JsonShapeShifter.js
class JsonShapeShifter {

  constructor(options = {}) {
    this.options = {
      leafProcessor: (value) => value, // Default identity function for leaf nodes
      keysProcessor: (key, path) => key, // Function for key transformations
      pathProcessors: {}, // Path-specific configurations
      template: null, // Default template set to null
      ...options,
    };

    for (const funcName of ['keysProcessor', 'leafProcessor']) {
      if (typeof this.options[funcName] !== 'function') {
        throw new Error(`BAD-CONGIG: 'options.${funcName}' must be a function.`);
      }
    }
  }


  formatJsByTemplate(inJs, template = this.options.template, currentPath = '') {
    console.log()
    console.log('blabla', this.options.template)
    console.log()
    // Use the class-level template if none is provided
    if (template === undefined || template === null) {
      template = inJs; // Fallback to using inJs as the template
    }

    if (typeof inJs === 'object' && inJs !== null) {
      if (!Array.isArray(template)) {
        const jsRes = {};
        for (const key in template) {
          const newPath = currentPath === '' ? key : `${currentPath}.${key}`;
          const processedKey = this.options.keysProcessor(key, newPath);
          if (inJs.hasOwnProperty(key) && template.hasOwnProperty(key)) { // Ensure template has the key
            jsRes[processedKey] = this.formatJsByTemplate(inJs[key], template[key], newPath);
          }
        }
        return jsRes;

      } else {
        const jsRes = [];
        for (let i = 0; i < inJs.length; i++) {
          const newPath = `${currentPath}[${i}]`;
          // NOTE: Arrays will always be formated to template first location format
          jsRes.push(this.formatJsByTemplate(inJs[i], template[0], newPath));
        }

        return jsRes;
      }

    } else {
      return this.processLeaf(inJs, currentPath);
    }

  }


  processLeaf(value, path) {
    const pathProcessors = this.options.pathProcessors[path];
    if (pathProcessors && typeof pathProcessors === 'function') {
      return pathProcessors(value);
    }
    return this.options.leafProcessor(value);
  }

}


module.exports = JsonShapeShifter;
