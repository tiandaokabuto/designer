/**
 * 最近打开项目列表
 */
import React, { useState, useMemo } from 'react';
import { Table, Button, Input, message } from 'antd';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import { newProject, openProject, readAllFileName } from '../common/utils';
import { changeCurrentProject } from '../reduxActions';

import './index.scss';

export default useInjectContext(({ history }) => {
  const [name, setName] = useState('');
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
    },
    {
      title: '创建时间',
      dataIndex: 'birthtime',
    },
    {
      title: '修改时间',
      dataIndex: 'mtime',
    },
  ];
  const fileList = useMemo(() => {
    return readAllFileName();
  }, []);
  return (
    <div className="recentproject">
      <div className="recentproject-leftcontent">
        <div className="recentproject-leftcontent-newproject">
          <Input
            placeholder="请输入新建项目名称"
            onChange={e => {
              setName(e.target.value);
            }}
          />
          <Button
            type="primary"
            onClick={() => {
              if (!name) {
                message.info('请填写项目名称');
                return;
              }
              history.push('/designGraphEdit');
              setTimeout(() => {
                newProject(name, () => {
                  changeCurrentProject(name);
                });
              }, 0);
            }}
          >
            新建项目
          </Button>
        </div>
        <h2>最近使用项目</h2>
        <Table
          columns={columns}
          dataSource={fileList}
          scroll={{
            y: 'calc(100vh - 327px)',
          }}
          onRow={record => {
            return {
              onClick: event => {
                // 打开对应的项目
                openProject(record.name);
                changeCurrentProject(record.name);
                history.push('/designGraphEdit');
              },
            };
          }}
        />
      </div>
      <div className="recentproject-rightcontent">
        <div className="recentproject-rightcontent-close"></div>
      </div>
    </div>
  );
});
