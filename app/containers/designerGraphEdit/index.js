import React from 'react';
import GGEditor from 'gg-editor';
import { Button } from 'antd';
import { withRouter } from 'react-router';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';
import FlowContextMenu from './layout/GraphContainer/components/EditorContextMenu/FlowContextMenu';
import ReuseCommand from './layout/GraphContainer/components/EditorContextMenu/ReuseCommand';

import GraphContainer from './layout/GraphContainer';
import GraphItem from './layout/GraphItem';
import GraphParamPanel from './layout/GraphParamPanel';
import Image from '../images/icon.jpg';
import ExecuteImage from '../images/execute.jpg';
import EditImage from '../images/edit.jpg';

import DesignerBody from './components/DesignerBody';

import { history } from '../../store/configureStore';

import './index.scss';

const ErrorPage = withRouter(({ history, errMessage }) => {
  return (
    <div
      style={{
        color: 'red',
      }}
    >
      {errMessage}
      <br />
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        一键恢复
      </Button>
    </div>
  );
});

class ErrorCapture extends React.Component {
  state = {
    hasError: false,
    errMessage: '',
  };
  componentDidCatch(err) {
    this.setState({
      hasError: true,
      errMessage: err.stack.toString(),
    });
  }
  render() {
    const { hasError, errMessage } = this.state;
    if (hasError) return <ErrorPage errMessage={errMessage} />;
    return this.props.children;
  }
}

export default () => {
  return (
    <ErrorCapture>
      <GraphBlockHeader history={history} />
      <DragEditorHeader type="process" />

      <GGEditor
        className="designergraph editor"
        onBeforeCommandExecute={e => {
          const { command } = e;
        }}
        onAfterCommandExecute={e => {
          const { command } = e;
        }}
      >
        <GraphItem />
        <GraphContainer history={history} />
        <GraphParamPanel />
        <FlowContextMenu />
        {/* <ReuseCommand /> */}
      </GGEditor>
    </ErrorCapture>
  );
};
