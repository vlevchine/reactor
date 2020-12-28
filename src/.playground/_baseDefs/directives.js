const { SchemaDirectiveVisitor } = require('graphql-tools'),
  { defaultFieldResolver, defaultObjectResolver } = require('graphql');
//Compile-time directives, no processing in run-time
class ModelDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {}
  visitObject(obj) {}
  visitScalar(scalar) {}
}
class FakeDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {}
  visitObject(obj) {}
}

//run-time directives
class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}

class ValidateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}

class TransformDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, a, b) {
    const { resolve = defaultFieldResolver } = field,
      params = this.args;
    field.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      const { system, unit } = params;
      if (typeof result === 'string') {
        return `${system}_${unit}_${result}`;
      }
      return result;
    };
  }
  visitObject(obj) {
    const { resolve = defaultObjectResolver } = obj;
    obj.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      return result;
    };
  }
}

class IntlDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const context = args[2];
      const defaultText = await resolve.apply(this, args);
      // In this example, path would be ["Query", "greeting"]:
      const path = [details.objectType.name, field.name];
      return translate(defaultText, path, context.locale);
    };
  }
}

const schemaDirectives = {
    upper: UpperCaseDirective,
    model: ModelDirective,
    validate: ValidateDirective,
    fake: FakeDirective,
    intl: IntlDirective,
    transform: TransformDirective,
  },
  directiveSDL = `directive @model(entity: Boolean, kind: String, unique: Boolean, defaultValue: String, assoc: String, through: String, virtual: Boolean) on FIELD_DEFINITION | OBJECT | SCALAR
directive @validate(unique: Boolean, isEmail: Boolean, isAlphanumeric: Boolean, notNull: Boolean, isAfter: Boolean, isBefore: Boolean,, max: Float, min: Float,) on FIELD_DEFINITION
directive @transform(unit: String, system: String) on FIELD_DEFINITION | OBJECT
directive @entity on OBJECT
directive @fake(use: String, any: String, count: Int, skip: Boolean, init: Boolean, prefix: String, with: String) on FIELD_DEFINITION | OBJECT
directive @upper on FIELD_DEFINITION
directive @intl on FIELD_DEFINITION
`;
//validation rules: see https://sequelize.org/master/manual/models-definition.html
module.exports = { schemaDirectives, directiveSDL };
