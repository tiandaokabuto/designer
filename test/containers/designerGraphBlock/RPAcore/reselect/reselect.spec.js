import memoize from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/reselect';

describe('test memoize', () => {
  it('test memoize', () => {
    const transformStatementImpl = jest.fn(
      (padding, statement, result, moduleMap, options) => {}
    );
    const transformStatement = memoize(transformStatementImpl);
    let padding = '  ';
    let statement = { hasModified: false };
    let result = { output: '' };
    let moduleMap = new Map();
    let options = {};
    transformStatement(padding, statement, result, moduleMap, options);
    expect(transformStatementImpl).toHaveBeenCalled();
    transformStatement(padding, statement, result, moduleMap, options);
    expect(transformStatementImpl.mock.calls.length).toBe(1);
    padding = ' ';
    transformStatement(padding, statement, result, moduleMap, options);
    expect(transformStatementImpl.mock.calls.length).toBe(2);
    statement = { hasModified: false };
    transformStatement(padding, statement, result, moduleMap, options);
    expect(transformStatementImpl.mock.calls.length).toBe(3);
    transformStatement(padding, statement, result, moduleMap, options);
    expect(transformStatementImpl.mock.calls.length).toBe(3);
    statement.hasModified = true;
    transformStatement(padding, statement, result, moduleMap, options);
    expect(transformStatementImpl.mock.calls.length).toBe(4);
  });
});
