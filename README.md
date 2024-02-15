
# JsonShapeShifter

JsonShapeShifter is a versatile JavaScript library designed to transform JSON objects based on specified templates and custom processing functions. It facilitates the dynamic reshaping of JSON structures, tailored for various applications including API responses, data normalization, and particularly for converting JSON to XML where strict element order is required. This capability is especially valuable in contexts like SOAP-based services, where the stringent order of XML elements is critical. Given that MongoDB/Mongoose may retrieve objects keys in an unpredictable order (at least this happened to me), JsonShapeShifter ensures the structure is standardized, making it seamlessly compatible for XML transformation and adhering to SOAP's strict requirements.

## Features

- **Flexible JSON Transformation**: Transform JSON objects and arrays with ease using customizable templates.
- **Custom Processing Functions**: Apply custom functions to process keys and leaf nodes, providing extensive control over the transformation.
- **Path-Specific Processing**: Use path processors for targeted transformations, including support for wildcard processing in arrays.

## Usage

### Basic Transformation

```javascript
const JsonShapeShifter = require('path/to/json-shape-shifter');

const shaper = new JsonShapeShifter();
const input = { name: "John", age: 30, favoriteHero: "MacGiver" };
const template = { favoriteHero: undefined, name: undefined }; // Doesn't includes 'age' and 'favoriteHero' goes first

const output = shaper.formatJsByTemplate(input, template);
console.log(output); // Output: { favoriteHero: "MacGiver", name: "John" }
```

## Custom Key and Leaf Processing
```javascript
const shaper = new JsonShapeShifter({
  keysProcessor: (key) => key.toUpperCase(),
  leafProcessor: (value) => typeof value === "string" ? value.toUpperCase() : value,
});

const input = { name: "John" };
const output = shaper.formatJsByTemplate(input);
console.log(output); // Output: { NAME: "JOHN" }

## Path-Specific Processing
const shaper = new JsonShapeShifter({
  pathProcessors: {
    "details.age": (value) => value > 18 ? "adult" : "minor",
  },
});

const input = { details: { age: 20 } };
const template = { details: { age: undefined } };

const output = shaper.formatJsByTemplate(input, template);
console.log(output); // Output: { details: { age: "adult" } }
```

## Array Processing with Wildcards
```javascript
const config = {
  pathProcessors: {
    "hobbies[*].name": (value) => value.toUpperCase(),
  },
};

const shaper = new JsonShapeShifter(config);

const input = {
  hobbies: [
    { name: "sing" },
    { name: "dance" },
    { name: "draw" },
  ],
};

const output = shaper.formatJsByTemplate(input);
console.log(output);
// Output: { hobbies: [{ name: "SING" }, { name: "DANCE" }, { name: "DRAW" }] }
```

## TODO
- Create a package for distribution.
- Add Express support?? Evaluate the feasibility and benefits of integrating with Express for standardizing JSON responses and dynamically filtering fields.
