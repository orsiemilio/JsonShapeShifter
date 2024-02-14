const JsonShapeShifter = require('../src/JsonShapeShifter');


describe('JsonShapeShifter', () => {
  test('transforms simple object based on template', () => {
    const shaper = new JsonShapeShifter();
    const input = { name: "John", age: 30 };
    const template = { name: undefined };

    const output = shaper.formatJsByTemplate(input, template);
    expect(output).toEqual({ name: "John" });
  });


  test('applies custom key processor', () => {
    const shaper = new JsonShapeShifter({
      keysProcessor: (key) => key.toUpperCase()
    });
    const input = { name: "John" };
    const template = { name: undefined };

    const output = shaper.formatJsByTemplate(input, template);
    expect(output).toHaveProperty('NAME', 'John');
  });


  test('applies custom leaf processor', () => {
    const shaper = new JsonShapeShifter({
      leafProcessor: (value) => typeof value === 'string' ? value.toUpperCase() : value
    });
    const input = { name: "John" };

    const output = shaper.formatJsByTemplate(input);
    expect(output).toEqual({ name: "JOHN" });
  });


  test('handles path-specific configuration', () => {
    const shaper = new JsonShapeShifter({
      pathProcessors: {
        'details.age': (value) => value > 18 ? 'adult' : 'minor'
      }
    });
    const input = { details: { age: 20 } };
    const template = { details: { age: undefined } };

    const output = shaper.formatJsByTemplate(input, template);
    expect(output).toEqual({ details: { age: 'adult' } });
  });


  test('uses class-level template if none provided in method call', () => {
    const template = { name: undefined };
    const shaper = new JsonShapeShifter({
      template: template
    });
    const input = { name: "John", age: 30 };

    const output = shaper.formatJsByTemplate(input);
    expect(output).toEqual({ name: "John" });
  });

  test('overwrite class-level template with provided in method call', () => {
    const template = { name: undefined };
    const shaper = new JsonShapeShifter({
      template: template
    });
    const input = { name: "John", age: 30 };

    const template2 = { age: undefined };
    const output = shaper.formatJsByTemplate(input, template2);
    expect(output).toEqual({ age: 30 });
  });

  
  test('array formatting', () => {
    const template = {
      name: undefined,
      age: undefined,
      hobbies: [
        {
          name: undefined,
          category: undefined,
          dedication: {
            hours: undefined,
            frecuency: undefined,
          }
        }
      ],
    };

    const shaper = new JsonShapeShifter({ template });

    const input = {
      name: "Emilio",
      lastName: "Orsi",
      hobbies: [
        {
          name: "percussion",
          dedication: {
            hours: "2",
            frecuency: "daily",
          },
          category: "music",
          somethigElse: "I don't know what else to add"
        },
        {
          name: "sing",
          dedication: {
            frecuency: "twice a week",
            hours: "1",
          },
          category: "music",
          anotherSomethigElse: "Already told you, I don't know what else to add :)"
        }
      ],
      age: 34,
    };

    const output = shaper.formatJsByTemplate(input);
    console.log(JSON.stringify(output, null , 2))
    expect(JSON.stringify(output)).toEqual(JSON.stringify({
      name: "Emilio",
      age: 34,
      hobbies: [
        {
          name: "percussion",
          category: "music",
          dedication: {
            hours: "2",
            frecuency: "daily",
          },
        },
        {
          name: "sing",
          category: "music",
          dedication: {
            hours: "1",
            frecuency: "twice a week",
          },
        }
      ],
    }));
  });

});
