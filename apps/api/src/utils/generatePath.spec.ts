import generatePath from './generatePath';
import * as pathToRegexp from 'path-to-regexp';

describe('generatePath', () => {
  const spy = jest.spyOn(pathToRegexp, 'compile');

  afterEach(() => {
    spy.mockClear();
  });

  it('will add single param to path', () => {
    expect(generatePath('/path/:id', { id: 3 })).toEqual('/path/3');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/path/:id');
  });
  it('will add multiple params to path', () => {
    expect(
      generatePath('/path/:param1/:param2', { param1: 3, param2: 4 }),
    ).toEqual('/path/3/4');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('/path/:param1/:param2');
  });

  it('will not run compile when path is slash', () => {
    expect(generatePath('/')).toEqual('/');
    expect(spy).not.toHaveBeenCalled();
  });
});
