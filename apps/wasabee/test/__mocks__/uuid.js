module.exports = {
  v1: jest.fn(() => 'mocked-uuid-v1'),
  v4: jest.fn(() => 'mocked-uuid-v4'),
  default: {
    v1: jest.fn(() => 'mocked-uuid-v1'),
    v4: jest.fn(() => 'mocked-uuid-v4'),
  }
};