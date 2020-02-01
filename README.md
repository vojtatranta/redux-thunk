# Redux Thunk service

This package is completely built on top `redux-thunk`
https://github.com/reduxjs/redux-thunk

All the credits should got to original creators.

This project started as a fork of `redux-thunk`. And this only wraps the
original library and is its dependency.

## Injecting a Custom Argument Factory

The problem was that powerful function `withExtraArgument` has one flaw. You
could not get state or dispatch inside it.

So the original usage was like this:

```js
const api = 'http://www.example.com/sandwiches/';
const whatever = 42;

const store = createStore(
  reducer,
  applyMiddleware(thunk.withExtraArgument({ api, whatever })),
);

// later
function fetchUser(id) {
  return (dispatch, getState, { api, whatever }) => {
    // you can use api and something else here
  };
}
```

But obvious problem was that how could you construct such url for fetch
dynamically using state? Like this:

```js
class Api {
  constructor(getState, fetchApi) {
    this.getState = getState
    this.fetchApi = fetchApi
  }

  get(url) {
    return this.fetchApi.get(`${this.getState().config.base Url}/${url}`)
  }
}
```

You could not do so. And that's just one case. There many and many occasion
where you need app state to execute sideffects or at least to simplify the code
and not to repeat yourself.

So the solution was an API like this:

```js
const store = createStore(
  reducer,
  applyMiddleware(
    thunk.withExtraArgument((dispatch, getState) => ({
      api: new Api(getState, fetch.bind(window)),
      whatever,
    })),
  ),
);
```

To achieve this the middleware needed to be changed. I tried to
[persuade](https://github.com/reduxjs/redux-thunk/issues/277) the mantainers to
add it. Howerever, it was considered to be too much advanced for `redux-thunk`.
Fair enough. I forked it.

## Usage

This library only wraps `redux-thunk` but changes API a bit.

```js
import createThunkService from 'redux-thunk-service';

const store = createStore(
  reducer,
  applyMiddleware(
    createThunkService((dispatch, getState) => ({
      api: new Api(getState, fetch.bind(window)),
      whatever,
    })),
  ),
);
```

That's it. The factory is only called once when the store is instantiated. This
means that instances in the factory are created only ones.

I definitely recommend this for passing dependencies to do side effects.

## Typescript support

I have a problems with running typescript properly in this lib. I managed to fix
all the big issues but there was still one types test that failed and I did not
know what to do with it so I commented it out.

If you knew how to [fix this test](./test/typescript.ts#L164) please do!

It seems to me that typing in the `redux-thunk` was not correct for connected
props. Consider this:

```ts
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

const thunkActionCreator = (): ThunkResult<Promise<void>> => (dispatch, getState) => {
  return Promise.resolve()
}

// calling pure action creator returns a function logically
thunkActionCreator() === fn(dispatch, getState) {}

// but when dispatched, ti returns result of thunk
dispatch(thunkActionCreator()) === Promise.resolve()

// props like this should return an error
interface Props {
  thunkActionCreator: typeof thunkActionCreator
}
// And it does! But if you call bindActionCreators in the connect() it "unpacked" the action creators.
// But this result in the problem:

export function App(props: Props) {
  // The problem
  props.thunkActionCreator() = Promise.resolve() // Types says OK but it is wrong!! Why? Because:
  typeof thunkActionCreator is a Function, not Promise.resolve()
}

export default connect(
  () => ({}),
  dispatch => bindActionCreators({ thunkActionCreator }, dispatch)
)

// other file

// This is correct:
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { ThunkDispatchAction } from 'redux-thunk-service'

const thunkActionCreator = (): ThunkResult<Promise<void>> => (dispatch, getState) => {
  return Promise.resolve()
}

interface Props {
  thunkActionCreator: ThunkDispatchAction<typeof thunkActionCreator>
}

export function App(props: Props) {
  // The correct type!
  props.thunkActionCreator() === Promise.resolve()
}

export default connect(
  () => ({}),
  dispatch => bindActionCreators({ thunkActionCreator }, dispatch)
)
```

So don't forget to wrapp thunk action createor with
`ThunkDispatchAction<typeof thunkActionCreator>`. And if this is wrong please
file an issue and help me to fix it!

Thanks

## License

MIT
