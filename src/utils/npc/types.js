// Types and interfaces converted from TypeScript to JavaScript
export const Primitives = {
  type: "string | number",
};

export class WeightedValue {
  constructor(w, v) {
    this.w = w;
    this.v = v;
  }
}

export class Option {
  constructor(w, v, original) {
    this.w = w;
    this.v = v;
    this.original = original;
  }
}

export class Operator {
  constructor(fn, original) {
    this.fn = fn;
    this.original = original;
  }
}

export class Group {
  constructor(value) {
    this.value = value;
  }
}

export class SchemaElement {
  constructor(value) {
    this.value = value;
  }
}

export class SchemaDescriptor {
  constructor(descriptor) {
    this.descriptor = descriptor;
  }
}

export class SchemaResult {
  constructor(result) {
    this.result = result;
  }
}
