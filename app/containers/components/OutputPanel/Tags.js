import { Tag, Icon } from 'antd';
import React from 'react';
import PropTypes from 'prop-types';

import './Tages.scss';

const { CheckableTag } = Tag;

const Tags = ({ tagsData, className, selectedTags, handleChange }) => {
  const checkTagIsChecked = label => {
    for (let i = 0; i < selectedTags.length; i += 1) {
      if (label === selectedTags[i]) return true;
    }
    return false;
  };

  return (
    <div className={className} style={{ marginTop: -38 }}>
      {tagsData.map(({ label, icon, fill }) => (
        <CheckableTag
          // style={{
          //   background: 'rgba(50,166,127,1)',
          // }}
          key={label}
          checked={checkTagIsChecked(label)}
          onChange={checked => handleChange(checked, label)}
        >
          {/* <Icon type={icon} style={{ color: fill }} /> */}
          <Icon type={icon} style={{ color: 'black' }} />
          <span style={{ color: 'black' }} className={`${className}-label`}>
            {label}
          </span>
        </CheckableTag>
      ))}
    </div>
  );
};

Tags.propTypes = {
  tagsData: PropTypes.arrayOf(PropTypes.object).isRequired,
  className: PropTypes.string,
  selectedTags: PropTypes.arrayOf(PropTypes.string),
  handleChange: PropTypes.func.isRequired,
};
Tags.defaultProps = {
  className: '',
  selectedTags: [''],
};

export default Tags;
