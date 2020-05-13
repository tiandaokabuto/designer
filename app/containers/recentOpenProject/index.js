/**
 * 最近打开项目列表
 */
import React, { useState, useMemo } from 'react';
import { Table, Button, Input, Icon, message, Popconfirm } from 'antd';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import GraphBlockHeader from '../common/GraphBlockHeader';
import { SDIcon } from '../common/components';
import RecentBackImg from '../images/recent_back.png';
import DiffImg from '../images/diff.png';
import CloseImg from '../images/close.png';

import PATH_CONFIG from '@/constants/localFilePath.js';

import {
  newProject,
  openProject,
  readAllFileName,
  formatDateTime as FormatDateTime,
  deleteFolderRecursive,
  checkProjectExist,
} from '../common/utils';
import {
  changeCurrentProject,
  clearGrapheditorData,
  resetGraphEditData,
} from '../reduxActions';

import './index.scss';

export default useInjectContext(({ history }) => {
  const [name, setName] = useState('');
  const [flag, setFlag] = useState(false);
  const [isJump, setIsJump] = useState(
    history.location.state && history.location.state.jump
  );

  const fileList = useMemo(() => {
    return readAllFileName();
  }, [flag]);

  const [modalVisible, setModalVisible] = useState(false);
  const processs = require('process');
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      width: '50%',
      ellipsis: true,
      render: title => {
        return <span style={{ color: 'rgba(50, 166, 127, 1)' }}>{title}</span>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'birthtime',
      ellipsis: true,
      width: '50%',
      render: FormatDateTime,
    },
    {
      title: '修改时间',
      dataIndex: 'mtime',
      ellipsis: true,
      width: '200px',
      render: (text, record) => {
        const time = FormatDateTime(text);
        const handleDeletProject = e => {
          console.log('!!!!!!!!!');
          e.stopPropagation();
          deleteFolderRecursive(PATH_CONFIG('project', record.name));
          setFlag(flag => !flag);
          const historyState = history.location.state;
          if (
            historyState &&
            historyState.projectName &&
            historyState.projectName === record.name
          ) {
            if (historyState.jump) {
              historyState.jump = false;
              setIsJump(false);
            }
          }
        };

        return (
          <div>
            {time}
            <Popconfirm
              title="确定要删除该项目吗?"
              onConfirm={handleDeletProject}
              onCancel={e => {
                e.stopPropagation();
              }}
              okText="确定"
              cancelText="取消"
            >
              <SDIcon
                style={{ marginLeft: '10px' }}
                url={CloseImg}
                onClick={e => {
                  e.stopPropagation();
                }}
              />
            </Popconfirm>
          </div>
        );
      },
    },
    /* {
      title: '',
      dataIndex: 'action',
      render: (text, record) => {
        return (
          <SDIcon
            url={CloseImg}
            onClick={e => {
              e.stopPropagation();
              deleteFolderRecursive(PATH_CONFIG('project', record.name));
              setFlag(flag => !flag);
            }}
          ></SDIcon>
        );
      },
    }, */
  ];

  const handleCreatNewProject = () => {
    if (!name) {
      message.info('请填写项目名称');
      return;
    }
    if (checkProjectExist(name)) {
      message.info('项目已存在，请重新填写');
      return false;
    }
    history.push({
      pathname: '/designGraphEdit',
      state: {
        projectName: name,
      },
    });
    setTimeout(() => {
      newProject(name, () => {
        changeCurrentProject(name);
      });
    }, 0);
  };

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
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onClick={handleCreatNewProject}
            >
              <img
                src={DiffImg}
                alt="projectIcon"
                style={{ marginRight: '14px' }}
              />
              新建项目
            </Button>
          </div>
          <h2>最近使用项目</h2>
          <Table
            columns={columns}
            dataSource={fileList}
            scroll={{
              y: 'calc(100vh - 400px)',
            }}
            ellipsis={true}
            onRow={record => {
              return {
                onClick: event => {
                  // 打开对应的项目
                  openProject(record.name);
                  changeCurrentProject(record.name);
                  // clearGrapheditorData();
                  resetGraphEditData();
                  history.push({
                    pathname: '/designGraphEdit',
                    state: {
                      projectName: record.name,
                    },
                  });
                },
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
