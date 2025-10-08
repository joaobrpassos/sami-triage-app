// app/backend/__tests__/unit/mock.provider.test.js
import mockProvider from '../../src/providers/ai/mock.provider.js';

describe('Mock AI Provider', () => {
  test('should return a response with complete method', async () => {
    const response = await mockProvider.complete('test prompt');
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  test('should handle structured data input', async () => {
    const data = { symptoms: 'headache', severity: 5 };
    const response = await mockProvider.complete(data);
    expect(response).toContain('headache');
  });
});
