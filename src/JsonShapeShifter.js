// JsonShapeShifter.js
class JsonShapeShifter {
  constructor(options = {}) {
    this.options = {
      leafProcessor: (value) => value,
      keysProcessor: (key, path) => key,
      leafProcessorsByPath: {},
      template: null,
      ...options,
    };

    // Check that functions are actualy functions :)
    for (const funcName of ["keysProcessor", "leafProcessor"]) {
      if (typeof this.options[funcName] !== "function") {
        throw new Error(
          `BAD-CONFIG: 'options.${funcName}' must be a function.`
        );
      }
    }
  }

  formatJsByTemplate(inJs, template = this.options.template, currentPath = "") {
    // Use the class-level template if none is provided
    if (template === undefined || template === null) {
      template = inJs; // Fallback to using inJs as the template
    }

    if (typeof inJs === "object" && inJs !== null) {
      if (!Array.isArray(template)) {
        const jsRes = {};
        for (const key in template) {
          const newPath = currentPath === "" ? key : `${currentPath}.${key}`;
          const processedKey = this.options.keysProcessor(key, newPath);
          if (inJs.hasOwnProperty(key) && template.hasOwnProperty(key)) {
            // Ensure template has the key
            jsRes[processedKey] = this.formatJsByTemplate(
              inJs[key],
              template[key],
              newPath
            );
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
    const leafP = this.options.leafProcessorsByPath;
    // if path has arrays, we can use * to process all entrance
    const scapedPath = path.replace(/\[[0-9]+\]/, "[*]");
    const leafProcessorsByPath = leafP[path] || leafP[scapedPath];

    if (leafProcessorsByPath && typeof leafProcessorsByPath === "function") {
      return leafProcessorsByPath(value);
    }
    return this.options.leafProcessor(value);
  }
}

module.exports = JsonShapeShifter;
