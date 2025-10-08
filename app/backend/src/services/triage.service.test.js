// app/backend/__tests__/unit/triage.service.test.js
import { runTriage } from '../../src/services/triage.service.js';

describe('Triage Service', () => {
  test('should process valid triage data', async () => {
    const data = {
      symptoms: 'Headache and fever',
      severity: 5,
      duration: '2 days',
      age: 30,
      gender: 'male'
    };

    const result = await runTriage(data);
    expect(result).toHaveProperty('assessment');
    expect(result).toHaveProperty('nextStep');
  });

  test('should handle missing optional fields', async () => {
    const data = {
      symptoms: 'Cough',
      severity: 3
    };

    const result = await runTriage(data);
    expect(result).toHaveProperty('assessment');
  });
});
