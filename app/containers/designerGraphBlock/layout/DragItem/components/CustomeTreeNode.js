import React, { createContext, useState, useRef } from 'react';
import { Icon } from 'antd';

import DragCard from './DragCard';
import { BasicStatementTag } from '../../statementTags';

const TreeContext = createContext({});

export default class Tree extends React.Component {
  static TreeNode = props => {
    console.log(props, 'hhh');
    const isLeaf = !props.children;
    const [open, setOpen] = useState(false);
    return (
      <TreeContext.Consumer>
        {context => {
          return (
            <div
              style={{
                height: isLeaf ? 32 : '',
                lineHeight: isLeaf ? '32px' : '',
                position: 'relative',
              }}
            >
              {!isLeaf && (
                <Icon
                  type="minus-square"
                  onClick={() => setOpen(open => !open)}
                />
              )}
              {/* {props.icon} */}
              {isLeaf ? <DragCard item={props.item} /> : props.title}
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
        <div>{this.props.children}</div>
      </TreeContext.Provider>
    );
  }
}
