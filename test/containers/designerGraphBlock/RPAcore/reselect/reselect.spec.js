import memoize from '../../../../../app/containers/designerGraphBlock/RPAcore/graphBlockToCode/reselect';

describe('test memoize', () => {
  it('test memoize', () => {
    let transformStatementImpl = jest.fn(
      (padding, statement, result, moduleMap, options) => {}
    );
    let transformStatement = memoize(transformStatementImpl);
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
    expect(statement.hasModified).toBe(false);
    expect(transformStatementImpl.mock.calls.length).toBe(4);

    transformStatementImpl = jest.fn(
      (padding, statement, result, moduleMap, options) => {}
    );
    transformStatementImpl.mockReturnValue(['test', new Map()]);
    transformStatementImpl.mockReturnValue([
      'test',
      new Map().set('name', 'xl'),
    ]);
    transformStatement = memoize(transformStatementImpl);
    expect(
      transformStatement(padding, statement, result, moduleMap, options)[0]
    ).toBe('test');
    transformStatement(padding, statement, result, moduleMap, options);
    expect(moduleMap.get('name')).toBe('xl');
    expect(result.output).toBe('test');
  });
});
