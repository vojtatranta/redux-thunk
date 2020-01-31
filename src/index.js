function createThunkMiddleware(extraArgument) {
  return ({dispatch, getState}) => {
    const normalizedExtraArgument =
      typeof extraArgument === 'function'
        ? extraArgument(dispatch, getState)
        : extraArgument;

    return (next) => (action) => {
      if (typeof action === 'function') {
        return action(dispatch, getState, normalizedExtraArgument);
      }

      return next(action);
    };
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
