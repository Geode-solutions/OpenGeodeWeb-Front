// Oxlint JS plugin: a ternary may only choose between simple values.
// Calls, functions, objects and arrays belong in an if/else or in a named variable.

const FORBIDDEN_TYPES = new Set([
  "ArrayExpression",
  "ArrowFunctionExpression",
  "AwaitExpression",
  "CallExpression",
  "ClassExpression",
  "FunctionExpression",
  "ImportExpression",
  "NewExpression",
  "ObjectExpression",
  "TaggedTemplateExpression",
]);

const WRAPPER_TYPES = new Set([
  "ChainExpression",
  "TSAsExpression",
  "TSNonNullExpression",
  "TSSatisfiesExpression",
  "TSTypeAssertion",
]);

function unwrap(node) {
  let current = node;
  while (WRAPPER_TYPES.has(current.type)) {
    current = current.expression;
  }
  return current;
}

const rule = {
  meta: {
    type: "suggestion",
    schema: [],
  },
  create(context) {
    function check(branch) {
      const { type } = unwrap(branch);
      if (FORBIDDEN_TYPES.has(type)) {
        context.report({
          node: branch,
          message: `A ternary branch must be a primitive value, found ${type}. Use an if/else or a named variable instead.`,
        });
      }
    }
    return {
      ConditionalExpression(node) {
        check(node.consequent);
        check(node.alternate);
      },
    };
  },
};

export default {
  meta: { name: "local" },
  rules: { "ternary-primitive-only": rule },
};
