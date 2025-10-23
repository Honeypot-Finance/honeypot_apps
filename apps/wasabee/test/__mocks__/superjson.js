// Mock for superjson to handle ES module issues in Jest
module.exports = {
  __esModule: true,
  default: {
    stringify: (value) => JSON.stringify(value),
    parse: (value) => JSON.parse(value),
    serialize: (value) => ({ json: value, meta: undefined }),
    deserialize: (payload) => payload.json,
    registerClass: () => {},
    registerCustom: () => {},
    allowErrorProps: () => {},
  },
  stringify: (value) => JSON.stringify(value),
  parse: (value) => JSON.parse(value),
  serialize: (value) => ({ json: value, meta: undefined }),
  deserialize: (payload) => payload.json,
  registerClass: () => {},
  registerCustom: () => {},
  allowErrorProps: () => {},
};

