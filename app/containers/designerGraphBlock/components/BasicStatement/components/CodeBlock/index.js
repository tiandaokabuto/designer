import React, { useRef } from 'react';
import { Modal } from 'antd';
import { useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';

import CodeMirrorEditor from '../../../../DragContainer/components/CodeMirrorEditor';
import {
  useNoticyBlockCodeChange,
  useTransformToPython,
} from '../../../../useHooks';

export default ({ visible, setVisible, interactiveCard }) => {
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
        readOnly={false}
        value={interactiveCard.codeValue || ''}
        id={interactiveCard.id}
        ref={codeMirrorRef}
      />
    </Modal>
  );
};
