describe('learn jest', () => {
  function sum(a, b) {
    return a + b;
  }
  it('test sum', () => {
    expect(sum(1, 2)).toBe(3);
  });
  it('test async', done => {
    setTimeout(() => {
      try {
        expect(0).not.toBeTruthy();
        done();
      } catch (err) {
        done(err);
      }
    }, 1000);
  });
  it('test function', () => {
    const callback = jest.fn(x => x + 1);
    callback(2);
    expect(callback.mock.calls.length).toBe(1);
  });
});
