import React, { useState, useEffect, memo } from 'react';
import { Modal, Button, Input, Table, Radio, Popconfirm } from 'antd';
import cloneDeep from 'lodash/cloneDeep';

import './index.scss';

let prevConfig = null;

// {
//   "XPath": ["//a[text()='工单管理']", "/html/body/div[1]/ul[1]/li[2]/a[1]"],
//   "JSpath": ["body > div:nth-child(1) > ul:nth-child(4) > li:nth-child(2) > a:nth-child(1)"],
//   "iframe": ["//iframe[@id='myIframe']", "//frame[@name='topFrame']"]
// }

const { TextArea } = Input;
const { confirm } = Modal;
export default memo(
  ({ param, markBlockIsUpdated, handleEmitCodeTransform }) => {
    param.config = param.config || {
      XPath: [],
      JSpath: [],
      iframe: [],
      selectedOption: 'xpath',
    };
    const { iframe, XPath, JSpath } = param.config;
    const [_, forceUpdate] = useState(0);
    // 是否显示xpath弹窗
    const [visible, setVisible] = useState(false);
    // iframe表格数据
    const [iframeData, setIframeData] = useState(() => {
      return iframe
        ? iframe.map((xpath, index) => {
            return {
              key: index + 1,
              xpath,
              desc: '',
            };
          })
        : [];
    });
    const [count, setCount] = useState(iframe ? iframe.length : 1);
    // xpath表格数据
    const [data, setData] = useState({
      xpathData: XPath,
      JSpathData: JSpath,
    });
    // xpath表格选择显示xpath还是jspath的选项
    const [selectedOption, setSelectedOption] = useState(
      param.config.selectedOption
    );

    // 查找选中的xpath信息
    const find = (selectedOption === 'xpath' ? XPath : JSpath).find(
      item => item.checked
    );
    let value = '';
    if (find) {
      value = JSON.stringify({
        [selectedOption === 'xpath' ? 'XPath' : 'JSpath']: find.xpath,
        iframe: iframe ? iframe : [],
      });
    }
    // 3个表格数据整合后的xpath值
    const [xpath, setXpath] = useState(value);
    // 用户自定义的xpath的值，如果没有自定义，则为3个表格整合之后的数据
    const [clientXpath, setClientXpath] = useState(param.value);

    // 处理切换xpath表格
    const handleRadioChecked = (index, checked) => {
      setData(data => {
        const temp =
          selectedOption === 'xpath' ? data.xpathData : data.JSpathData;
        const result = temp.concat();
        result.forEach((item, i) => {
          if (i !== index) {
            item.checked = false;
          } else {
            item.checked = checked;
          }
        });
        return { ...data };
      });
    };

    // 生成3个表格整合的值
    const handleGenerateXpath = () => {
      const { xpathData, JSpathData } = data;
      console.log(param);
      const find = (selectedOption === 'xpath' ? xpathData : JSpathData).find(
        item => item.checked
      );
      if (find || iframeData.length > 0) {
        const iframes = iframeData.map(item => item.xpath);
        const value = JSON.stringify({
          [selectedOption === 'xpath' ? 'XPath' : 'JSpath']: find
            ? find.xpath
            : '',
          iframe: iframes ? iframes : [],
        });
        if (value !== xpath) {
          setXpath(value);
          setClientXpath(JSON.stringify(value));
          param.config.iframe = iframes;
        }
      } else {
        setXpath('');
        setClientXpath(param.value);
        param.config.iframe = [];
      }
    };

    // 判断是否用户自定义的xpath
    const isClientXpathChange = () => {
      return clientXpath !== '' && clientXpath !== JSON.stringify(xpath);
    };

    // iframe的表格标题
    const iframeTitle = [
      {
        title: '序号',
        dataIndex: 'index',
        width: 68,
        render: (text, record, index) => index + 1,
      },
      {
        title: 'xpath',
        dataIndex: 'xpath',
        width: 303,
        render: (text, record) => {
          return (
            <Input
              defaultValue={text}
              key={visible ? '0' : '1'}
              onChange={e => {
                const newValue = e.target.value;
                const { target } = e;
                if (isClientXpathChange()) {
                  new Promise((resolve, reject) => {
                    showConfirm(resolve, reject);
                  })
                    .then(() => {
                      record.xpath = newValue;
                      handleGenerateXpath();
                      return newValue;
                    })
                    .catch(err => {
                      target.value = text;
                    });
                } else {
                  record.xpath = newValue;
                  handleGenerateXpath();
                }
              }}
            />
          );
        },
      },
      {
        title: '描述',
        dataIndex: 'desc',
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (text, record) =>
          iframeData.length >= 1 ? (
            <Popconfirm
              title={
                isClientXpathChange()
                  ? '删除会覆盖自定义xPath，确定删除？'
                  : '确定删除?'
              }
              onConfirm={() => {
                handleDeleteIframe(record.key);
                handleGenerateXpath();
              }}
            >
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

    // xpath的表格标题
    const xpathTitle = [
      {
        title: '选择',
        dataIndex: 'checked',
        width: 68,
        render: (checked, obj, index) => {
          return (
            <Radio
              checked={checked}
              onChange={e => {
                const newChecked = e.target.checked;
                const { target } = e;
                if (isClientXpathChange()) {
                  new Promise((resolve, reject) => {
                    showConfirm(resolve, reject);
                  })
                    .then(() => {
                      handleRadioChecked(index, newChecked);
                      return checked;
                    })
                    .catch(err => {
                      console.log(err);
                      return false;
                    });
                } else {
                  handleRadioChecked(index, newChecked);
                }
              }}
            />
          );
        },
      },
      {
        title:
          selectedOption === 'xpath' ? 'xpath列表(单选)' : 'JSpath列表(单选)',
        dataIndex: 'xpath',
        render: (text, obj) => {
          return (
            <Input
              defaultValue={text}
              key={visible && selectedOption === 'xpath' ? '0' : '1'}
              onChange={e => {
                const newValue = e.target.value;
                const { target } = e;
                if (isClientXpathChange()) {
                  new Promise((resolve, reject) => {
                    showConfirm(resolve, reject);
                  })
                    .then(() => {
                      obj.xpath = newValue;
                      handleGenerateXpath();
                      return newValue;
                    })
                    .catch(err => {
                      target.value = text;
                    });
                } else {
                  obj.xpath = newValue;
                  handleGenerateXpath();
                }
              }}
            />
          );
        },
      },
    ];

    // 触发3个表格的数据更新
    useEffect(() => {
      const { iframe = [], XPath = [], JSpath = [], selectedOption } =
        param.config || {};
      setIframeData(
        iframe.map((xpath, index) => ({
          key: index + 1,
          xpath,
          desc: '',
        }))
      );
      setCount(iframe ? iframe.length : 1);
      const newData = {
        xpathData: XPath,
        JSpathData: JSpath,
      };
      if (JSON.stringify(data) !== JSON.stringify(newData)) {
        setData(newData);
      }

      setSelectedOption(selectedOption);
    }, [param.config]);

    // 触发3个表格数据整合
    useEffect(() => {
      handleGenerateXpath();
    }, [selectedOption, param.config, data, iframeData]);

    // 重置自定义xpath值
    useEffect(() => {
      setClientXpath(param.value);
    }, []);

    // 提示覆盖自定义xpath
    const showConfirm = (resolve, reject) => {
      confirm({
        title: '你确定要执行该操作吗',
        content: '该操作会覆盖自定义xpath',
        onOk() {
          if (resolve) resolve();
        },
        onCancel() {
          if (reject) reject();
        },
      });
    };

    // iframe表格添加数据
    const handleAdd = () => {
      setIframeData(iframeData => {
        iframeData.push({
          key: count,
          xpath: '',
          desc: '',
        });
        return [...iframeData];
      });
      setCount(count => count + 1);
    };

    // iframe表格删除数据
    const handleDeleteIframe = key => {
      setIframeData(iframeData => {
        const index = iframeData.findIndex(item => item.key === key);
        iframeData.splice(index, 1);
        return [...iframeData];
      });
    };

    return (
      <div className="xpathParam">
        <TextArea
          style={{ height: 32 }}
          className="xpathInput"
          value={clientXpath}
          disabled
        />
        <Button
          icon="credit-card"
          style={{
            marginLeft: 8,
          }}
          onClick={() => {
            prevConfig = cloneDeep(param.config);
            setVisible(true);
          }}
        ></Button>
        <Modal
          title="xpath"
          visible={visible}
          width={630}
          bodyStyle={{
            height: '60vh',
            overflow: 'auto',
          }}
          onCancel={() => {
            if (
              prevConfig &&
              JSON.stringify(prevConfig) !== JSON.stringify(param.config)
            ) {
              param.config = prevConfig;
              setClientXpath(param.value);
            }
            forceUpdate(_ => ++_);
            setVisible(false);
          }}
          onOk={() => {
            setVisible(false);
            param.value = clientXpath;
            markBlockIsUpdated();
            handleEmitCodeTransform();
          }}
        >
          <div className="xpathParam-title">iframe</div>
          <Button
            onClick={handleAdd}
            type="primary"
            style={{ marginBottom: 16 }}
          >
            添加iframe
          </Button>
          <Table
            className="iframeTable"
            columns={iframeTitle}
            dataSource={iframeData}
            pagination={false}
            rowKey="key"
          />
          <div className="xpathParam-choice">
            <span className="xpathParam-choice-title">选择方法</span>
            <Radio.Group
              value={selectedOption}
              onChange={e => {
                if (isClientXpathChange()) {
                  new Promise(resolve => {
                    showConfirm(resolve);
                  })
                    .then(() => {
                      param.config.selectedOption = e.target.value;
                      setSelectedOption(e.target.value);
                      return e.target.value;
                    })
                    .catch(err => console.log(err));
                } else {
                  param.config.selectedOption = e.target.value;
                  setSelectedOption(e.target.value);
                }
              }}
            >
              <Radio value="xpath">xpath</Radio>
              <Radio value="selector">选择器(selector)</Radio>
            </Radio.Group>
          </div>
          <div className="xpathParam-title">元素xpath</div>
          <Table
            className="xpathTable"
            columns={xpathTitle}
            dataSource={
              selectedOption === 'xpath' ? data.xpathData : data.JSpathData
            }
            pagination={false}
            rowKey="key"
          />
          <div className="xpathParam-title">自定义xpath</div>
          <TextArea
            value={clientXpath}
            onChange={e => {
              if (e.target.value === '') {
                setClientXpath(JSON.stringify(xpath));
              } else setClientXpath(e.target.value);
            }}
          />
        </Modal>
      </div>
    );
  }
);
