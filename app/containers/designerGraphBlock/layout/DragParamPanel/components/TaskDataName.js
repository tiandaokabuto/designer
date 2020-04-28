import React, { Fragment, useState, useEffect } from 'react';
import { Table, Form, Input, Icon, message } from 'antd';
import axios from 'axios';

import AutoCompleteInputParam from './AutoCompleteInputParam';
import api from '../../../../../api';

import './TaskDataName.scss';

const originColumns = [
  {
    title: '变量名',
    dataIndex: 'variableName',
    key: 'variableName',
    editable: true,
    width: '90px',
    ellipsis: true,
  },
  {
    title: '表头名',
    dataIndex: 'headerName',
    key: 'headerName',
    ellipsis: true,
  },
];

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props }) => {
  // Provider提供form的操作api
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

// 创建form，使用from包裹的组件将会自带 this.props.form 属性，提供相应的form API
const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: false,
    };
  }

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if (editing) {
        this.input.focus();
      }
    });
  };

  save = e => {
    const { record, handleSave } = this.props;
    // 校验input里面的值是否符合rules
    this.form.validateFields((error, values) => {
      if (error && error[e.currentTarget.id]) {
        return;
      }
      this.toggleEdit();
      handleSave({ ...record, ...values });
    });
  };

  renderCell = form => {
    this.form = form;
    const { children, dataIndex, record, title } = this.props;
    const { editing } = this.state;
    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {/*
          经过 getFieldDecorator 包装的控件，表单控件会自动添加 value（或 valuePropName 指定的其他属性） onChange（或 trigger 指定的其他属性）
          数据同步将被 Form 接管，这会导致以下结果：
          1. 你不再需要也不应该用 onChange 来做同步，但还是可以继续监听 onChange 等事件。
          2. 你不能用控件的 value defaultValue 等属性来设置表单域的值，默认值可以用 getFieldDecorator 里的 initialValue。
          3. 你不应该用 setState，可以使用 this.props.form.setFieldsValue 来动态改变表单值。 */
        form.getFieldDecorator(dataIndex, {
          rules: [
            {
              // required: true,
              // message: `${title} is required.`,
            },
          ],
          initialValue: record[dataIndex],
        })(
          // 回调ref，函数接受 React 组件实例或 HTML DOM 元素作为参数，以使它们能在其他地方被存储和访问。
          <Input
            ref={node => (this.input = node)}
            onPressEnter={this.save}
            onBlur={this.save}
          />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap ant-table-row-cell-ellipsis ant-table-row-cell-break-word"
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    );
  };

  render() {
    const {
      editable,
      record,
      dataIndex,
      title,
      index,
      handleSave,
      children,
      ...restProps
    } = this.props;
    // Consumer消费antd form双向绑定提供的api
    return (
      <td {...restProps}>
        {editable ? (
          <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
        ) : (
          children
        )}
      </td>
    );
  }
}

export default function TaskDataName({
  param,
  aiHintList,
  appendDataSource,
  keyFlag,
  handleEmitCodeTransform,
  handleValidate,
}) {
  param.dataSource = param.dataSource || [];
  param.tableName = param.tableName || '';
  param.selectedRowKeys = param.selectedRowKeys || [];
  let originValue = param.value || '';
  const originDataSource = param.dataSource;
  const [dataSource, setdataSource] = useState(originDataSource);
  const [loading, setLoading] = useState(false);
  const [showColumn, setShowColumn] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState(param.selectedRowKeys);
  let timer = null;

  useEffect(() => {
    // 首次进入不刷新
    if (param.tableName !== param.value) {
      // 清空选择情况
      param.selectedRowKeys = [];
      param.selectedRows = [];
      setSelectedRowKeys([]);
      // 刷新table表
      refreshDataSource();
    }
  }, [param.value]);

  const components = { body: { row: EditableFormRow, cell: EditableCell } };
  const rowSelection = {
    columnWidth: '50px',
    onChange: (selectedRowKeys, selectedRows) => {
      param.selectedRowKeys = [...selectedRowKeys];
      param.selectedRows = [...selectedRows];
      setSelectedRowKeys(selectedRowKeys);
      handleEmitCodeTransform();
    },
    getCheckboxProps: record => {
      // diabled的时候要去掉
      if (record.variableName === '') {
        return {
          disabled: record.variableName === '',
          checked: false,
        };
      }
    },
    selectedRowKeys,
  };

  const handleSave = row => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    param.dataSource = newData;
    const selectedIndex = param.selectedRows.findIndex(
      item => item.key === row.key
    );
    param.selectedRows[selectedIndex].variableName = row.variableName;
    handleEmitCodeTransform();
    setdataSource(newData);
  };

  const columns = originColumns.map(col => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const refreshDataSource = () => {
    const { value } = param;
    if (timer) clearTimeout(timer);
    setLoading(prevState => {
      // 查询太快,加个定时让他有（查询了的）感觉^_^
      timer = setTimeout(() => {
        if (!prevState) {
          axios
            .get(api('taskDataFields'), {
              params: {
                taskDataName: value.replace(/"/g, '').replace(/'/g, ''),
              },
            })
            .then(res => {
              return res ? res.data : { code: -1 };
            })
            .then(res => {
              if (res.code !== -1 && Array.isArray(res.data)) {
                // 刷新时，维护已经选择项的删除和更改
                const newSelectedRows = param.selectedRows.reduce(
                  (total, nextValue) => {
                    const reduceIndex = res.data.findIndex(
                      item => item.key === nextValue.key
                    );
                    if (reduceIndex > -1) {
                      total.push(nextValue);
                    }
                    return total;
                  },
                  []
                );
                const newSelectedRowKeys = param.selectedRowKeys.reduce(
                  (total, nextValue) => {
                    const reduceIndex = res.data.findIndex(
                      item => item.key === nextValue
                    );
                    if (reduceIndex > -1) {
                      total.push(nextValue);
                    }
                    return total;
                  },
                  []
                );
                param.selectedRows = newSelectedRows;
                param.selectedRowKeys = newSelectedRowKeys;
                // 刷新后，把新的数据源的每个项和进行更改的项进行合并
                const newDataSource = res.data.map(item => {
                  const selectedItem = param.selectedRows.find(
                    selectiItem => item.key === selectiItem.key
                  );
                  const newItem = {
                    key: item.key,
                    variableName: selectedItem
                      ? selectedItem.variableName
                      : item.value,
                    headerName: item.value,
                  };
                  return newItem;
                });
                // 把合并后的数据源赋到原子能力的json上
                param.dataSource = newDataSource;
                param.tableName = param.value;
                setdataSource(newDataSource);
                setLoading(false);
                clearTimeout(timer);
                // 不触发这个函数不知道为什么不保存数据结构
                handleEmitCodeTransform();
                return true;
              }
              setdataSource([]);
              param.dataSource = [];
              param.tableName = '';
              setLoading(false);
              clearTimeout(timer);
              return false;
            })
            .catch(err => {
              message.error('刷新失败');
              setLoading(false);
              clearTimeout(timer);
              console.log(err);
            });
        }
      }, 500);
      return true;
    });
  };

  const triggerShowColumn = () => {
    setShowColumn(!showColumn);
  };

  return (
    <Fragment>
      <div className="parampanel-item">
        <span className="param-title" title={param.desc}>
          {param.cnName}
        </span>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AutoCompleteInputParam
            param={param}
            aiHintList={aiHintList}
            appendDataSource={appendDataSource}
            keyFlag={keyFlag}
            handleEmitCodeTransform={handleEmitCodeTransform}
            handleValidate={handleValidate}
          />
        </div>
      </div>
      <div className="parampanel-item">
        <p className="task-data-title">
          <span>
            数据字段
            <Icon
              className="task-data-title-icon-refresh"
              type="redo"
              onClick={refreshDataSource}
            />
          </span>
          <span
            className="task-data-title-icon-down"
            onClick={triggerShowColumn}
          >
            <Icon type="down" />
          </span>
        </p>
      </div>
      <div
        className={
          showColumn
            ? 'parampanel-item'
            : 'parampanel-item task-data-column-hide'
        }
      >
        {/* components:自定义组件,rowSelection:可选框配置,dataSource:数据源,columns:列配置,
          loading:是否加载中,pagination:不要分页,scroll:滚动设置,size:表格大小 */}
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          pagination={false}
          scroll={{ y: 125 }}
          size="middle"
        />
      </div>
    </Fragment>
  );
}
