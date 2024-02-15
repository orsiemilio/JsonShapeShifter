// JsonShapeShifter.js
class JsonShapeShifter {
  constructor(options = {}) {
    this.options = {
      leafProcessor: (value) => value,
      keysProcessor: (key, path) => key,
      pathProcessors: {},
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

    for (const path in this.options.pathProcessors) {
      if (typeof this.options.pathProcessors[path] !== "function") {
        throw new Error(
          `BAD-CONFIG: 'options.pathProcessors[${path}]' must be a function.`
        );
      }
    }
  }

  formatJsByTemplate(inJs, template = this.options.template, currentPath = "") {
    // Fallback to using inJs as the template
    template = template || inJs;

    // If custom processor found for current path, then cut the circuit
    const customProcessor = this.getCustomPathsProcessor(currentPath);
    if (customProcessor) return customProcessor(inJs, template, currentPath);

    if (typeof inJs === "object" && inJs !== null) {
      if (!Array.isArray(template)) {
        const jsRes = {};
        for (const key in template) {
          const newPath = currentPath === "" ? key : `${currentPath}.${key}`;
          const processedKey = this.keysProcessor(key, newPath);
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
      return this.processLeaf(inJs);
    }
  }

  keysProcessor(key, path) {
    return this.options.keysProcessor(key, path);
  }

  processLeaf(value) {
    return this.options.leafProcessor(value);
  }

  /**
   * You need to make shure that the path is correct (expect the desired type)
   * @returns
   */
  getCustomPathsProcessor(path) {
    const leafP = this.options.pathProcessors;
    // if path has arrays, we can use * to process all entrance
    const scapedPath = path.replace(/\[[0-9]+\]/, "[*]");
    return leafP[path] || leafP[scapedPath];
  }
}

module.exports = JsonShapeShifter;
