import store from "./store";
import {addAction, subAction} from "./store/action.js";

store.subscribe(() => {
  console.log(store.getState());
});


store.dispatch(addAction(10));
store.dispatch(addAction(15));
store.dispatch(subAction(3));
