/**
 * 最近打开项目列表
 */
import React, { useState, useMemo } from 'react';
import { Table, Button, Input, Popconfirm, message, Modal } from 'antd';
import { useInjectContext } from 'react-hook-easier/lib/useInjectContext';

import GraphBlockHeader from '../common/GraphBlockHeader';
import { SDIcon } from '../components';
import RecentBackImg from '../assets/images/recent_back.png';
import DiffImg from '../assets/images/diff.png';
import CloseImg from '../assets/images/close.png';

import PATH_CONFIG from '@/constants/localFilePath.js';

import {
  newProject,
  openProject,
  readAllFileName,
  formatDateTime as FormatDateTime,
  deleteFolderRecursive,
  checkProjectExist,
} from '_utils/utils';
import {
  changeCurrentProject,
  clearGrapheditorData,
  resetGraphEditData,
  updateCurrentPagePosition,
} from '../reduxActions';

import './index.scss';

export default useInjectContext(({ history }) => {
  const [name, setName] = useState('');
  const [flag, setFlag] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [isJump, setIsJump] = useState(
    history.location.state && history.location.state.jump
  );

  const fileList = useMemo(() => {
    return readAllFileName();
  }, [flag]);

  const handleDeletProject = () => {
    deleteFolderRecursive(PATH_CONFIG('project', recordName));
    setFlag(flag => !flag);
    const historyState = history.location.state;
    if (
      historyState &&
      historyState.projectName &&
      historyState.projectName === recordName
    ) {
      if (historyState.jump) {
        historyState.jump = false;
        setIsJump(false);
      }
    }
    setModalVisible(false);
  };

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

        return (
          <div>
            {time}
            <div
              className="deletIconContent"
              onClick={e => e.stopPropagation()}
            >
              <SDIcon
                style={{ marginLeft: '10px' }}
                url={CloseImg}
                onClick={() => {
                  setRecordName(record.name);
                  setModalVisible(true);
                }}
              />
            </div>
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

    // const reg = /[?:<>|*"{}\[\]\/\\]/g;
    const reg = /(^\s+)|(\s+$)|(\.+$)|[?:@&=+,;<>\s*|*"{}\[\]\/\\]/g;
    if (reg.test(name)) {
      message.error('不能包含特殊字符，前后不能包含空格');
      return;
    }

    if (name.length > 100) {
      message.info('输入的内容长度不能大于100');
      return;
    }

    if (checkProjectExist(name)) {
      message.info('项目已存在，请重新填写');
      return false;
    }

    history.push({
      pathname: '/designGraph/edit',
      state: {
        projectName: name,
      },
    });
    setTimeout(() => {
      updateCurrentPagePosition('editor');
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
              onBlur={e => {
                e.target.value = e.target.value.trim();
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
            className="recent-project-table"
            scroll={{
              y: 'calc(100vh - 400px)',
            }}
            pagination={false}
            ellipsis
            onRow={record => {
              return {
                onClick: event => {
                  // 打开对应的项目
                  updateCurrentPagePosition('editor');
                  openProject(record.name);
                  changeCurrentProject(record.name);
                  // clearGrapheditorData();
                  resetGraphEditData();
                  history.push({
                    pathname: '/designGraph/edit',
                    state: {
                      projectName: record.name,
                    },
                  });
                },
              };
            }}
          />
          <Modal
            visible={modalVisible}
            centered
            onOk={handleDeletProject}
            onCancel={() => setModalVisible(false)}
          >
            <p>确定要删除吗？</p>
          </Modal>
        </div>
        <div className="recentproject-rightcontent">
          {/* <div className="recentproject-rightcontent-close"></div> */}
        </div>
      </div>
    </div>
  );
});
