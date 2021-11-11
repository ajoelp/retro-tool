import { canUpdateBoard } from './ColumnsRouter';

describe('canUpdateBoard', () => {
  it('will throw an error if no board id is supplied', () => {
    const next = jest.fn();

    const request = { params: {} } as any;
    const response = {} as any;

    expect(() => canUpdateBoard(request, response, next)).rejects.toThrow(
      Error,
    );
    expect(next).not.toHaveBeenCalled();
  });
});
