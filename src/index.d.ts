import {
  Action,
  ActionCreatorsMapObject,
  AnyAction,
  Dispatch,
  Middleware,
} from 'redux';
import { ThunkDispatch, ThunkAction, ThunkMiddleware } from 'redux-thunk';

export { ThunkDispatch, ThunkAction, ThunkMiddleware };

export type ServiceThunkActionDispatch<
  TActionCreator extends (...args: any[]) => ThunkAction<any, any, any, any>
> = (
  ...args: Parameters<TActionCreator>
) => ReturnType<ReturnType<TActionCreator>>;

export type ExtraThunkArgFactory<
  TState,
  TBasicAction extends Action<any>,
  TReturn
> = (
  dispatch: ThunkDispatch<TState, TReturn, TBasicAction>,
  getState: () => TState,
) => TReturn;

export type ServiceThunkMiddleware<
  TState,
  TBasicAction extends Action<any>,
  TExtraThunkArgFactory extends ExtraThunkArgFactory<
    TState,
    TBasicAction,
    ReturnType<TExtraThunkArgFactory>
  >
> = ThunkMiddleware<TState, TBasicAction, ReturnType<TExtraThunkArgFactory>>;

declare const createServiceThunk: <
  TState,
  TBasicAction extends Action<any>,
  TExtraThunkArgFactory extends ExtraThunkArgFactory<
    TState,
    TBasicAction,
    ReturnType<TExtraThunkArgFactory>
  >
>(
  servicesFactory: TExtraThunkArgFactory,
) => ServiceThunkMiddleware<TState, TBasicAction, TExtraThunkArgFactory>;

export default createServiceThunk;

/**
 * Redux behaviour changed by middleware, so overloads here
 */
declare module 'redux' {
  /**
   * Overload for bindActionCreators redux function, returns expects responses
   * from thunk actions
   */
  function bindActionCreators<
    TActionCreators extends ActionCreatorsMapObject<any>
  >(
    actionCreators: TActionCreators,
    dispatch: Dispatch,
  ): {
    [TActionCreatorName in keyof TActionCreators]: ReturnType<
      TActionCreators[TActionCreatorName]
    > extends ThunkAction<any, any, any, any>
      ? ServiceThunkActionDispatch<TActionCreators[TActionCreatorName]>
      : TActionCreators[TActionCreatorName];
  };
}
