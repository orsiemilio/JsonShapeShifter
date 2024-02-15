
# JsonShapeShifter

JsonShapeShifter is a handy tool made to change JSON objects into different shapes using specific rules and functions you set. It's super useful for a bunch of tasks, like fixing up data to send over the web, organizing information, or even getting data ready to be turned into XML for special web services, where keeping things in the right order is super important.

A while back, I faced issues with the structure of JSON data from MongoDB. To solve this, especially since I had to work with SOAP-based services where XML demands precise ordering of values, I developed a solution similar to this.

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
