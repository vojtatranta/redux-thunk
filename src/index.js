import thunk from 'redux-thunk'

function createServiceThunkMiddleware(extraArgumentFactory) {
  return ({dispatch, getState}) => {
    const normalizedExtraArgument = extraArgumentFactory(dispatch, getState)

    return thunk.withExtraArgument(normalizedExtraArgument)({ dispatch, getState });
  };
}

const createServiceThunk = createServiceThunkMiddleware

export default createServiceThunk;
