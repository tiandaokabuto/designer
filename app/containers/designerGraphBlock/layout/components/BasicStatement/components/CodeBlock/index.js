import React, { useRef } from 'react';
import { Modal } from 'antd';

import CodeMirrorEditor from '../../../../DragContainer/components/CodeMirrorEditor';

export default ({ visible, setVisible, interactiveCard }) => {
  const codeMirrorRef = useRef(null);
  return (
    <Modal
      width="80vw"
      bodyStyle={{
        height: '75vh',
      }}
      centered
      visible={visible}
      onOk={() => {
        console.log(codeMirrorRef);
      }}
      onCancel={() => {
        setVisible(false);
      }}
      closable={false}
    >
      <CodeMirrorEditor
        value={interactiveCard.codeValue || '#在此处编写代码'}
        ref={codeMirrorRef}
      />
    </Modal>
  );
};
