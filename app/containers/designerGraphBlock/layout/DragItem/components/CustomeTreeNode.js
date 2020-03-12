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
  state = {
    filter: '',
  };

  static getDerivedStateFromProps(nextProps) {
    console.log(nextProps);
    return {
      filter: nextProps.filter,
    };
  }

  static TreeNode = props => {
    const isLeaf = !props.children;
    const [open, setOpen] = useState(false);
    return (
      <TreeContext.Consumer>
        {({ filter }) => {
          const needHidden =
            isLeaf &&
            filter &&
            !props.title &&
            props.item &&
            props.item.text &&
            !props.item.text.includes(filter);
          return (
            <div
              style={{
                ...generateStyle(isLeaf),
                display: needHidden ? 'none' : '',
              }}
            >
              <div
                className={isLeaf ? '' : 'sd-tree-open'}
                style={{
                  display: 'flex',
                  justifyContent: 'stretch',
                  alignItems: 'center',
                  height: '40px',
                }}
              >
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
              </div>
              {open && props.children}
            </div>
          );
        }}
      </TreeContext.Consumer>
    );
  };
  render() {
    return (
      <TreeContext.Provider value={this.state}>
        <div className="sd-tree">{this.props.children}</div>
      </TreeContext.Provider>
    );
  }
}
