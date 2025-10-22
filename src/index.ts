import createStore from "./store-core";
import createReactStore from "./store-react";
import createActions from "./createActions";

const nexus = { createStore, createReactStore, createActions };

export { createStore, createReactStore, createActions };
export default nexus;
