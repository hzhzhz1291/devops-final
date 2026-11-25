'use strict';

const { Counter, Registry, collectDefaultMetrics } = require('prom-client');

const registry = new Registry();
collectDefaultMetrics({ register: registry });
const requests = new Counter({
  name: 'http_requests_total',
  help: 'Number of HTTP responses, excluding metrics scrapes',
  labelNames: ['route', 'status'],
  registers: [registry],
});

async function handleRequest(request, response) {
  const path = (request.url || '/').split('?')[0];
  if (request.method === 'GET' && path === '/metrics') {
    try {
      const metrics = await registry.metrics();
      response.setHeader('Content-Type', registry.contentType);
      response.end(metrics);
    } catch {
      response.statusCode = 500;
      response.end('Metrics unavailable');
    }
    return;
  }

  const route = path === '/' || path === '/health' ? path : 'other';
  response.once('finish', () => requests.inc({ route, status: String(response.statusCode) }));
  if (request.method === 'GET' && path === '/') {
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('DevOps Final Project');
  } else if (request.method === 'GET' && path === '/health') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ status: 'ok' }));
  } else {
    response.statusCode = 404;
    response.end('Not Found');
  }
}

module.exports = { handleRequest };
