/**
 * 最近打开项目列表
 */
import React, { useState, useMemo } from 'react';
import { Table, Button, Input, Icon, message, Modal } from 'antd';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import GraphBlockHeader from '../common/GraphBlockHeader';
import { SDIcon } from '../common/components';
import RecentBackImg from '../images/recent_back.png';
import CloseImg from '../images/close.png';

import {
  newProject,
  openProject,
  readAllFileName,
  formatDateTime,
  deleteFolderRecursive
} from '../common/utils';
import { changeCurrentProject, clearGrapheditorData } from '../reduxActions';

import './index.scss';

export default useInjectContext(({ history }) => {
  const [name, setName] = useState('');
  const [flag, setFlag] = useState(false);
  const fileList = useMemo(() => {
    return readAllFileName();
  }, [flag]);
  const [modalVisible, setModalVisible] = useState(false);
  const processs = require('process');
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      render: title => {
        return <span style={{ color: 'rgba(50, 166, 127, 1)' }}>{title}</span>;
      }
    },
    {
      title: '创建时间',
      dataIndex: 'birthtime',
      render: formatDateTime
    },
    {
      title: '修改时间',
      dataIndex: 'mtime',
      render: formatDateTime
    },
    {
      title: '',
      dataIndex: 'action',
      render: (text, record) => {
        return (
          <SDIcon
            url={CloseImg}
            onClick={e => {
              e.stopPropagation();
              console.log(record.name);
              deleteFolderRecursive(`${process.cwd()}/project/${record.name}`);
              setFlag(flag => !flag);
            }}
          ></SDIcon>
        );
      }
    }
  ];

  const isJump = history.location.state && history.location.state.jump;
  return (
    <div>
      <GraphBlockHeader tag="recentProject" />
      <div className="recentproject">
        <div className="recentproject-leftcontent">
          {isJump ? (
            <SDIcon
              url={RecentBackImg}
              size="32"
              style={{ marginBottom: 16 }}
              onClick={() => {
                history.goBack();
              }}
            />
          ) : (
            'none'
          )}
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
              y: 'calc(100vh - 327px)'
            }}
            onRow={record => {
              return {
                onClick: event => {
                  console.log('点击行');
                  // 打开对应的项目
                  openProject(record.name);
                  changeCurrentProject(record.name);
                  clearGrapheditorData();
                  history.push('/designGraphEdit');
                }
              };
            }}
          />
        </div>
        <div className="recentproject-rightcontent">
          {/* <div className="recentproject-rightcontent-close"></div> */}
        </div>
      </div>
    </div>
  );
});
