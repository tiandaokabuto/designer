import React, { Fragment, useState } from 'react';
import { Table, Form, Input, Icon } from 'antd';
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
  },
  {
    title: '表头名',
    dataIndex: 'headerName',
    key: 'headerName',
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
      <div className="editable-cell-value-wrap" onClick={this.toggleEdit}>
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
  const originDataSource = [
    {
      key: '1',
      variableName: '胡彦斌',
      headerName: 32,
    },
    {
      key: '2',
      variableName: '胡彦祖',
      headerName: 42,
    },
  ];
  const [dataSource, setdataSource] = useState(originDataSource);
  const [loading, setLoading] = useState(false);
  const [showColumn, setShowColumn] = useState(true);

  const components = { body: { row: EditableFormRow, cell: EditableCell } };
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
    },
  };

  const handleSave = row => {
    const newData = [...dataSource];
    const index = newData.findIndex(item => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
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
    axios
      .get(api('taskDataFields'), {
        params: {
          taskDataName: '留言单',
        },
      })
      .then(res => {
        console.log(res);
        return res.data;
      })
      .then(res => {
        console.log(res);
      })
      .catch(err => console.log(err));
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
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          rowSelection={rowSelection}
          dataSource={dataSource}
          columns={columns}
          loading={loading}
        />
      </div>
    </Fragment>
  );
}
