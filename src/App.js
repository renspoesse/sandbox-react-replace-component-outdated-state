import React from "react";
import { Provider, useDispatch, useSelector, useStore } from "react-redux";

import store from "./store";
import "./styles.css";

// One of the breaking changes of React 16 was the order of lifecycle hooks
// when replacing a component (https://reactjs.org/blog/2017/09/26/react-v16.0.html).
// Specifically, the new component will start rendering before the old
// component has been cleaned up. The author of React explains why this happens:
// https://github.com/facebook/react/issues/12233#issuecomment-366128203.

// To get some strong guarantees (https://stackoverflow.com/questions/58135416/what-are-the-guarantees-on-react-lifecycle-event-order-between-components)
// on the new behavior we can refer to https://github.com/facebook/react/blob/master/packages/react-dom/src/__tests__/ReactCompositeComponent-test.js,
// specifically https://github.com/facebook/react/blob/e7b255341b059b4e2a109847395d0d0ba2633999/packages/react-dom/src/__tests__/ReactCompositeComponent-test.js#L1466.
// This test verifies that lifecycle hooks are executed in the correct order
// when replacing a component. The code in this sandbox replicates that test
// using hooks instead of a class component.

// The sandbox also adds a simple Redux store to demonstrate how this can
// lead to using outdated state when using React Redux.

const useComponent = (name) => {
  const dispatch = useDispatch();
  const store = useStore();

  // Note how the state is read in the render phase. If you look at the
  // console output you'll see that when replacing A with B, B renders
  // before A's componentWillUnmount resets the Redux state.
  const capturedState = useSelector((s) => s);

  const didMountRef = React.useRef(false);

  console.log(`${name} render`);

  React.useEffect(() => {
    // This effect runs with the capturedState value that was set in the
    // render phase. When replacing A with B, A's componentWillUnmount
    // has already run at this point so the state has been reset and
    // this value is outdated (it doesn't match `store.getState()`).
    console.log(
      `${name} componentDidMount, captured state is ${capturedState}, actual state is ${store.getState()}`
    );

    // Set the state to the name of the mounted component. This will
    // cause the component to re-render and log the newly captured state
    // in componentDidUpdate.
    dispatch({ name, type: "SET" });

    return () => {
      console.log(`${name} componentWillUnmount`);
      dispatch({ type: "RESET" });
    };
  }, []);

  React.useEffect(() => {
    // Only run this effect on update, not on mount.
    if (didMountRef.current) {
      console.log(
        `${name} componentDidUpdate, captured state is ${capturedState}, actual state is ${store.getState()}`
      );
    }
    didMountRef.current = true;
  });
};

const A = () => {
  useComponent("A");
  return <div>A</div>;
};

const B = () => {
  useComponent("B");
  return <div>B</div>;
};

export default function App() {
  const [foo, setFoo] = React.useState(true);
  return (
    <Provider store={store}>
      <div className="App">
        {foo ? <A /> : <B />}
        <button onClick={() => setFoo((value) => !value)}>Toggle</button>
      </div>
    </Provider>
  );
}
