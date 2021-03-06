import globalErrorMiddleware from './globalErrorMiddleware';
import { NotFoundError } from '../errors/NotFoundError';
import { Response } from 'express';
import { ApiRequest } from '../types/ApiRequest';

class ResponseMock {
  status(status: any) {
    return this;
  }

  json(data: any) {
    return this;
  }
}

const responseMock = new ResponseMock();

describe('globalErrorMiddleware', () => {
  const statusSpy = jest.spyOn(responseMock, 'status');
  const jsonSpy = jest.spyOn(responseMock, 'json');

  it('will throw a NotFoundError', async () => {
    const error = new NotFoundError('This is the message');
    const req = {} as ApiRequest;
    const next = jest.fn();
    await globalErrorMiddleware(error, req, responseMock as Response, next);

    expect(statusSpy).toHaveBeenCalledWith(404);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'not-found',
        message: error.message,
      }),
    );
  });

  it('will throw a Error', async () => {
    const error = new Error('This is the message');
    const req = {} as ApiRequest;
    const next = jest.fn();
    await globalErrorMiddleware(error, req, responseMock as Response, next);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'server-error',
        message: error.message,
      }),
    );
  });
});
