import chai from 'chai';
import { checkDirectory } from 'typings-tester';
import thunkMiddleware from '../src/index';

describe('thunk middleware', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const doDispatch = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const doGetState = () => {};
  const nextHandler = thunkMiddleware({
    dispatch: doDispatch,
    getState: doGetState,
  });

  it('must return a function to handle next', () => {
    chai.assert.isFunction(nextHandler);
    chai.assert.strictEqual(nextHandler.length, 1);
  });

  describe('handle next', () => {
    it('must return a function to handle action', () => {
      const actionHandler = nextHandler();

      chai.assert.isFunction(actionHandler);
      chai.assert.strictEqual(actionHandler.length, 1);
    });

    describe('handle action', () => {
      it('must run the given action function with dispatch and getState', (done) => {
        const actionHandler = nextHandler();

        actionHandler((dispatch, getState) => {
          chai.assert.strictEqual(dispatch, doDispatch);
          chai.assert.strictEqual(getState, doGetState);
          done();
        });
      });

      it('must pass action to next if not a function', (done) => {
        const actionObj = {};

        const actionHandler = nextHandler((action) => {
          chai.assert.strictEqual(action, actionObj);
          done();
        });

        actionHandler(actionObj);
      });

      it('must return the return value of next if not a function', () => {
        const expected = 'redux';
        const actionHandler = nextHandler(() => expected);

        const outcome = actionHandler();
        chai.assert.strictEqual(outcome, expected);
      });

      it('must return value as expected if a function', () => {
        const expected = 'rocks';
        const actionHandler = nextHandler();

        const outcome = actionHandler(() => expected);
        chai.assert.strictEqual(outcome, expected);
      });

      it('must be invoked synchronously if a function', () => {
        const actionHandler = nextHandler();
        let mutated = 0;

        // eslint-disable-next-line no-plusplus
        actionHandler(() => mutated++);
        chai.assert.strictEqual(mutated, 1);
      });
    });
  });

  describe('withExtraArgument', () => {
    it('must pass the third argument', (done) => {
      const extraArg = { lol: true };
      thunkMiddleware.withExtraArgument(extraArg)({
        dispatch: doDispatch,
        getState: doGetState,
      })()((dispatch, getState, arg) => {
        chai.assert.strictEqual(dispatch, doDispatch);
        chai.assert.strictEqual(getState, doGetState);
        chai.assert.strictEqual(arg, extraArg);
        done();
      });
    });

    it('must pass the result of extra argument factory', (done) => {
      const extraArg = (dispatch, getState) => ({dispatch, getState})
      thunkMiddleware.withExtraArgument(extraArg)({
        dispatch: doDispatch,
        getState: doGetState,
      })()((dispatch, getState, arg) => {
        chai.assert.strictEqual(dispatch, doDispatch);
        chai.assert.strictEqual(getState, doGetState);
        chai.assert.strictEqual(arg.dispatch, dispatch);
        chai.assert.strictEqual(arg.getState, getState);
        done();
      });
    });
  });

  describe('TypeScript definitions', function test() {
    this.timeout(0);

    it('should compile against index.d.ts', () => {
      checkDirectory(__dirname);
    });
  });
});
