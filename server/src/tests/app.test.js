import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app, { errorHandler } from '../app.js';

describe('app', () => {
  let originalConsoleError;

  before(() => {
    originalConsoleError = console.error;
    console.error = () => {};
  });

  after(() => {
    console.error = originalConsoleError;
  });
  it('returns health status', async () => {
    const response = await request(app).get('/api/health');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  });

  it('handles errors with a custom status', () => {
    const err = new Error('Handled failure');
    err.status = 418;

    const response = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      },
    };

    errorHandler(err, {}, response, () => {});

    assert.equal(response.statusCode, 418);
    assert.equal(response.body.error, 'Handled failure');
  });

  it('handles errors with the default status', () => {
    const response = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      },
    };

    errorHandler(new Error('Server broken'), {}, response, () => {});

    assert.equal(response.statusCode, 500);
    assert.equal(response.body.error, 'Server broken');
  });

  it('uses a fallback message when an error has no message', () => {
    const response = {
      statusCode: null,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.body = payload;
      },
    };

    errorHandler({}, {}, response, () => {});

    assert.equal(response.statusCode, 500);
    assert.equal(response.body.error, 'Internal server error');
  });
});
