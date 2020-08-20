// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import type { HashHistory } from 'history';
import blockcode from './blockcode';
import grapheditor from './grapheditor';
import debug from './debug';
import temporaryvariable from './temporaryvariable';

export default function createRootReducer(history: HashHistory) {
  return combineReducers<{}, *>({
    router: connectRouter(history),
    blockcode,
    grapheditor,
    temporaryvariable,
    debug,
  });
}
