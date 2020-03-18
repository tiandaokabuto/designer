// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import type { HashHistory } from 'history';
import counter from './counter';
import blockcode from './blockcode';
import grapheditor from './grapheditor';
import temporaryvariable from './temporaryvariable';
import test from './test';

export default function createRootReducer(history: HashHistory) {
  return combineReducers<{}, *>({
    router: connectRouter(history),
    counter,
    blockcode,
    grapheditor,
    temporaryvariable,
    test,
  });
}
