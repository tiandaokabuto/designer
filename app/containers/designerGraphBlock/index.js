import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { Button } from 'antd';
import { withRouter } from 'react-router';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import GraphBlockHeader from '../common/GraphBlockHeader';
import DragEditorHeader from '../common/DragEditorHeader';
import DragContainer from './layout/DragContainer';
import DragItem from './layout/DragItem';
import DragParamPanel from './layout/DragParamPanel';
import SyncAutomicList from './layout/DragItem/components/SyncAutomicList';

import { writeFile } from '../../nodejs';

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
          console.log(window.location.reload());
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

export default useInjectContext(({ history }) => {
  return (
    <ErrorCapture>
      <DndProvider backend={Backend}>
        <GraphBlockHeader />
        <DragEditorHeader type="block" />
        <div className="dragger-editor">
          <DragItem />
          <DragContainer />
          <DragParamPanel />
        </div>
        <SyncAutomicList />
      </DndProvider>
    </ErrorCapture>
  );
});
