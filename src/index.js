

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { createStore, applyMiddleware, compose, combineReducers } from "redux";
import { ViewportProvider } from 'components/Context';
import createSagaMiddleware from "redux-saga";
import { appReducer, eventsReducer} from './store/reducers';
import { watchApp } from "./store/sagas";
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';
import reportWebVitals from './reportWebVitals';
import './index.scss';
import { walletReducer } from "store/reducers/wallet";
import GitInfo from 'react-git-info/macro';

const gitInfo = GitInfo();
console.log("-----------------------------")
console.log("Git Info:")
if(gitInfo.branch){
  console.log(`git-branch: ${gitInfo.branch}`);
}
console.log(`date: ${new Date(gitInfo.commit.date).toISOString()}`);
console.log(`shortHash: ${gitInfo.commit.shortHash}`);
console.log("-----------------------------")
const Web3ProviderNetwork = createWeb3ReactRoot("NETWORK");

const composeEnhancers =
  process.env.NODE_ENV === "development" &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : null || compose;

const rootReducer = combineReducers({ app: appReducer, wallet: walletReducer, events: eventsReducer });

const sagaMiddleware = createSagaMiddleware();

const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(sagaMiddleware))
);

sagaMiddleware.run(watchApp);

function getLibrary(provider) {
  const library = new Web3(provider);
  library.pollingInterval = 12000
  return library;
}

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ViewportProvider>
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            <App />
          </Web3ProviderNetwork>
        </Web3ReactProvider>,
      </ViewportProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);