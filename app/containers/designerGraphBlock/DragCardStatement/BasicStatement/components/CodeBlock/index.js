import React, { useRef } from 'react';
import { Modal } from 'antd';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';

import CodeMirrorEditor from '../../../../DragContainer/CodeMirrorEditor';
import {
  useNoticyBlockCodeChange,
  useTransformToPython,
} from '../../../../useHooks';

export default ({ visible, setVisible, interactiveCard }) => {
  const stopDeleteKeyDown = e => {
    const matchKeyCode = [67, 86, 88, 90];
    if (e.keyCode === 46 || (e.ctrlKey && matchKeyCode.includes(e.keyCode))) {
      e.nativeEvent.stopImmediatePropagation();
      e.stopPropagation();
    }
  };

  const codeMirrorRef = useRef(null);
  const cards = useSelector(state => state.blockcode.cards);
  const noticyChange = useNoticyBlockCodeChange();
  const handleEmitCodeTransform = useTransformToPython();
  return (
    <Modal
      width="80vw"
      bodyStyle={{
        height: '75vh',
      }}
      centered
      destroyOnClose
      visible={visible}
      onOk={() => {
        const temp = codeMirrorRef.current.codeMirrorRef;
        if (temp) {
          const codeRef = temp.current;
          interactiveCard.codeValue = codeRef.getValue();
          interactiveCard.hasModified = true;
          noticyChange();
          handleEmitCodeTransform(cards);
          setVisible(false);
        }
      }}
      onCancel={() => {
        setVisible(false);
      }}
      closable={false}
    >
      <CodeMirrorEditor
        onKeyDown={e => stopDeleteKeyDown(e)}
        readOnly={false}
        value={interactiveCard.codeValue || ''}
        id={interactiveCard.id}
        ref={codeMirrorRef}
      />
    </Modal>
  );
};
