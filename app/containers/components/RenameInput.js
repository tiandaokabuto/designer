import React from 'react';
import { Input, message } from 'antd';

import { changeProcessTree, changeModuleTree } from '../reduxActions';
import PATH_CONFIG from '../../constants/localFilePath';
import { encrypt } from '../../login/utils';

const fs = require('fs');

export default (
  oldTitle,
  node,
  name,
  type,
  tree,
  persistentStorage,
  restoreCheckedTreeNode,
  getDecryptOrNormal
) => {
  node.title = (
    <Input
      autoFocus
      defaultValue={node.title}
      onBlur={e => {
        const newTitle = e.target.value;
        const reg = /(^\s+)|(\s+$)|(\.+$)|[?:@&=+,;<>\s*|*"{}\[\]\/\\]/g;

        if (reg.test(newTitle) || !newTitle) {
          message.error('不能包含特殊字符，前后不能包含空格');
          node.title = oldTitle;
          changeModuleTree([...tree]);
          persistentStorage();
          restoreCheckedTreeNode();
          return;
        }
        if (newTitle.length > 100) {
          message.info('输入的内容长度不能大于100');
          node.title = oldTitle;
          changeModuleTree([...tree]);
          persistentStorage();
          restoreCheckedTreeNode();
          return;
        }
        // 流程树
        if (type === 'process') {
          if (node.type === 'process') {
            const dirs = fs.readdirSync(PATH_CONFIG('project', name));
            const item = dirs.find(item => newTitle === item);
            if (!item) {
              node.title = newTitle;
              fs.rename(
                PATH_CONFIG('project', `${name}/${oldTitle}`),
                PATH_CONFIG('project', `${name}/${newTitle}`),
                err => {
                  if (err) {
                    message.error(err);
                  }
                }
              );
              changeProcessTree([...tree]);
              persistentStorage();
              restoreCheckedTreeNode();
            } else {
              message.info('重复命名');
              node.title = oldTitle;
              changeProcessTree([...tree]);
              persistentStorage();
              restoreCheckedTreeNode();
            }
          } else {
            node.title = newTitle;
            changeProcessTree([...tree]);
            persistentStorage();
            restoreCheckedTreeNode();
          }
        } else {
          // 流程块树
          if (node.type === 'process') {
            const dirs = fs.readdirSync(
              PATH_CONFIG('project', `${name}/${name}_module`)
            );
            const item = dirs.find(item => `${newTitle}.json` === item);
            if (!item) {
              node.title = newTitle;
              // 重命名对应的json文件
              fs.renameSync(
                PATH_CONFIG(
                  'project',
                  `${name}/${name}_module/${oldTitle}_module.json`
                ),
                PATH_CONFIG(
                  'project',
                  `${name}/${name}_module/${newTitle}_module.json`
                )
              );
              // 把json文件里面的流程块名也改为最新
              fs.readFile(
                PATH_CONFIG(
                  'project',
                  `${name}/${name}_module/${newTitle}_module.json`
                ),
                (err, data) => {
                  if (!err) {
                    const description = getDecryptOrNormal(data);
                    if (description.graphDataMap.properties) {
                      description.graphDataMap.properties[0].value = newTitle;
                    }
                    fs.writeFileSync(
                      PATH_CONFIG(
                        'project',
                        `${name}/${name}_module/${newTitle}_module.json`
                      ),
                      encrypt.argEncryptByDES(JSON.stringify(description))
                    );
                  } else {
                    console.log(err);
                  }
                }
              );
              changeModuleTree([...tree]);
              persistentStorage();
              restoreCheckedTreeNode();
            } else {
              message.info('重复命名');
              node.title = oldTitle;
              changeModuleTree([...tree]);
              persistentStorage();
              restoreCheckedTreeNode();
            }
          } else {
            node.title = newTitle;
            changeModuleTree([...tree]);
            persistentStorage();
            restoreCheckedTreeNode();
          }
        }
      }}
    />
  );
};
