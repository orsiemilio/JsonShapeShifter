/**
 * A class for transforming JSON objects based on specified templates and custom processing functions.
 */
class JsonShapeShifter {
  /**
   * Creates an instance of JsonShapeShifter.
   * @param {Object} options - Configuration options for the instance.
   * @param {Function} [options.leafProcessor] - Custom function to process leaf nodes.
   * @param {Function} [options.keysProcessor] - Custom function to process keys.
   * @param {Object.<string, Function>} [options.pathProcessors] - Object mapping paths to custom processor functions.
   * @param {Object|null} [options.template] - Default template to use for transformations.
   */
  constructor(options = {}) {
    // Validate the structure of the options object
    if (
      typeof options !== "object" ||
      options === null ||
      Array.isArray(options)
    ) {
      throw new TypeError("Invalid options parameter.");
    }

    // Set default values and destructure with validation
    const {
      leafProcessor = (value) => value,
      keysProcessor = (key, path) => key,
      pathProcessors = {},
      template = null,
    } = options;

    // Validate custom functions
    if (typeof leafProcessor !== "function") {
      throw new TypeError("options.leafProcessor must be a function.");
    }
    if (typeof keysProcessor !== "function") {
      throw new TypeError("options.keysProcessor must be a function.");
    }

    // Validate pathProcessors object
    if (
      typeof pathProcessors !== "object" ||
      pathProcessors === null ||
      Array.isArray(pathProcessors)
    ) {
      throw new TypeError("Invalid options.pathProcessors parameter.");
    }
    Object.entries(pathProcessors).forEach(([path, processor]) => {
      if (typeof processor !== "function") {
        throw new TypeError(
          `options.pathProcessors[${path}] must be a function.`
        );
      }
    });

    // Apply validated and default values
    this.options = {
      leafProcessor,
      keysProcessor,
      pathProcessors,
      template,
    };
  }

  /**
   * Transforms the input JSON according to the provided template or the default template.
   * @param {Object|Array} inJs - The input JSON to transform.
   * @param {Object|Array|null} template - The template to apply for transformation. Defaults to class-level template.
   * @param {string} currentPath - The current path being processed (used for nested transformations).
   * @returns {Object|Array} The transformed JSON.
   */
  formatJsByTemplate(inJs, template = this.options.template, currentPath = "") {
    // Fallback to using inJs as the template
    template = template || inJs;

    if (typeof template === "function") {
      return template(inJs);
    }

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

  /**
   * Processes a key using the custom keys processor.
   * @param {string} key - The key to process.
   * @param {string} path - The path of the key being processed.
   * @returns {string} The processed key.
   */
  keysProcessor(key, path) {
    return this.options.keysProcessor(key, path);
  }

  /**
   * Processes a leaf node using the custom leaf processor.
   * @param {any} value - The leaf node value to process.
   * @returns {any} The processed leaf node value.
   */
  processLeaf(value) {
    return this.options.leafProcessor(value);
  }

  /**
   * Retrieves a custom processor for a given path, if available.
   * @param {string} path - The path to check for a custom processor.
   * @returns {Function|undefined} The custom processor function for the path, if defined.
   */
  getCustomPathsProcessor(path) {
    const leafP = this.options.pathProcessors;
    // Wildcard * can be used to process all arrays entries
    const scapedPath = path.replace(/\[[0-9]+\]/, "[*]");
    return leafP[path] || leafP[scapedPath];
  }
}

module.exports = JsonShapeShifter;
