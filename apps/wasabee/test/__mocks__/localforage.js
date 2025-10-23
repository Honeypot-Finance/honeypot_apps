// Mock for localforage to handle storage issues in Jest
const createMockInstance = () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  clear: jest.fn().mockResolvedValue(undefined),
  length: jest.fn().mockResolvedValue(0),
  key: jest.fn().mockResolvedValue(null),
  keys: jest.fn().mockResolvedValue([]),
  iterate: jest.fn().mockResolvedValue(undefined),
  config: jest.fn(),
  dropInstance: jest.fn().mockResolvedValue(undefined),
  driver: jest.fn().mockReturnValue('mockDriver'),
  ready: jest.fn().mockResolvedValue(undefined),
  supports: jest.fn().mockReturnValue(true),
});

const localforageMock = {
  ...createMockInstance(),
  createInstance: jest.fn().mockImplementation(createMockInstance),
  INDEXEDDB: 'asyncStorage',
  WEBSQL: 'webSQLStorage',
  LOCALSTORAGE: 'localStorageWrapper',
};

module.exports = localforageMock;

