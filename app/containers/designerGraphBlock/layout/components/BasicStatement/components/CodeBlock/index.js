import React, { useRef } from 'react';
import { Modal } from 'antd';
import uniqueId from 'lodash/uniqueId';

import CodeMirrorEditor from '../../../../DragContainer/components/CodeMirrorEditor';

export default ({ visible, setVisible, interactiveCard }) => {
  const codeMirrorRef = useRef(null);
  return (
    <Modal
      width="80vw"
      key={uniqueId('codeMirror_')}
      bodyStyle={{
        height: '75vh',
      }}
      centered
      destroyOnClose={true}
      visible={visible}
      onOk={() => {
        const temp = codeMirrorRef.current.codeMirrorRef;
        if (temp) {
          const codeRef = temp.current;
          interactiveCard.codeValue = codeRef.getValue();
          setVisible(false);
        }
      }}
      onCancel={() => {
        setVisible(false);
      }}
      closable={false}
    >
      <CodeMirrorEditor
        value={interactiveCard.codeValue || ''}
        ref={codeMirrorRef}
      />
    </Modal>
  );
};
