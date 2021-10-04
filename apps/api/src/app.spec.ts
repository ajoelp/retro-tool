import { TestCase } from './utils/TestCase';

describe('App', () => {
  it('will respond with status route', async () => {
    const response = await TestCase.make().get('/');
    expect(response.body).toEqual({ status: 'ok' });
  });
});
