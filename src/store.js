import { createStore } from "redux";

const reducer = (state = undefined, action) => {
  switch (action.type) {
    case "RESET":
      return undefined;
    case "SET":
      return action.name;
    default:
      return state;
  }
};

const store = createStore(reducer);

export default store;
