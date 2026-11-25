'use strict';

const { handleRequest } = require('./app');

async function get(path) {
  let finish;
  const response = {
    statusCode: 200,
    setHeader: jest.fn(),
    once: jest.fn((event, callback) => { if (event === 'finish') finish = callback; }),
    end: jest.fn(() => { if (finish) finish(); }),
  };
  await handleRequest({ method: 'GET', url: path }, response);
  return response;
}

test('GET / returns the final project title', async () => {
  const response = await get('/');
  expect(response.statusCode).toBe(200);
  expect(response.end).toHaveBeenCalledWith('DevOps Final Project');
});

test('GET /health returns JSON status ok', async () => {
  const response = await get('/health');
  expect(response.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
  expect(JSON.parse(response.end.mock.calls[0][0])).toEqual({ status: 'ok' });
});

test('an unknown route returns 404', async () => {
  expect((await get('/missing')).statusCode).toBe(404);
});

test('GET /metrics exports the HTTP counter and Node.js metrics', async () => {
  await get('/');
  const response = await get('/metrics');
  const metrics = response.end.mock.calls[0][0];
  expect(metrics).toMatch(/http_requests_total\{route="\/",status="200"\} \d+/);
  expect(metrics).toContain('process_cpu_user_seconds_total');
});
