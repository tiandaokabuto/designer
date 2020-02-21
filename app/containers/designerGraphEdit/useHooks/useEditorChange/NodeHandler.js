import { findNodeById } from './utils';
import { setGraphDataMap } from '../../../reduxActions';

const canLink = () => {};

class NodeHandler {
  constructor(propsAPI) {
    this.propsAPI = propsAPI;
  }

  handleNodeChange = description => {
    if (description.action === 'add') {
      if (description.model.shape === 'processblock') {
        const key = description.item.id;
        setGraphDataMap(key, {
          properties: [
            {
              cnName: '输入参数',
              enName: 'param',
              value: '',
              default: '',
            },
            {
              cnName: '流程块返回',
              enName: 'output',
              value: '',
              default: '',
            },
          ],
        });
      }
    }
  };

  apiAction = command => {
    //console.log(command, this.propsAPI);
    setTimeout(() => {
      this.propsAPI.executeCommand(command);
    }, 0);
  };
}

export default NodeHandler;
