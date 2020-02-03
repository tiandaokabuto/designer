import React, { createContext, useState, useRef } from 'react';
import { Icon } from 'antd';

import DragCard from './DragCard';
import { BasicStatementTag } from '../../statementTags';

const TreeContext = createContext({});

const generateStyle = isLeaf => ({
  height: isLeaf ? 40 : 'auto',
  lineHeight: isLeaf ? '40px' : '',
  position: isLeaf ? 'unset' : 'relative',
  paddingLeft: isLeaf ? '16px' : 0,
  minHeight: '40px',
});

export default class Tree extends React.Component {
  static TreeNode = props => {
    console.log(props, 'hhh');
    const isLeaf = !props.children;
    const [open, setOpen] = useState(false);
    return (
      <TreeContext.Consumer>
        {context => {
          return (
            <div style={generateStyle(isLeaf)}>
              {!isLeaf && (
                <Icon
                  type={open ? 'minus-square' : 'plus-square'}
                  className="sd-tree-switcher"
                  onClick={() => setOpen(open => !open)}
                />
              )}
              {props.icon}
              {isLeaf ? (
                <DragCard item={props.item} />
              ) : (
                <span style={{ paddingLeft: '16px' }}>{props.title}</span>
              )}
              {open && props.children}
            </div>
          );
        }}
      </TreeContext.Consumer>
    );
  };
  render() {
    return (
      <TreeContext.Provider>
        <div className="sd-tree">{this.props.children}</div>
      </TreeContext.Provider>
    );
  }
}
