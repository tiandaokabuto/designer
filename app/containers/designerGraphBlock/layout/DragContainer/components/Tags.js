import { Tag, Icon } from 'antd';
import React, { useState } from 'react';

import './Tages.scss';

const { CheckableTag } = Tag;

const tages = ({ className }) => {
  const tagsFromServer = [
    { label: 'DEBUG', icon: 'warning', fill: '#0060bf' },
    { label: 'INFO', icon: 'message', fill: '#dca607' },
    { label: 'WARN', icon: 'exclamation-circle', fill: '#ff6a00' },
    { label: 'ERROR', icon: 'close-circle', fill: '#ea5154' },
  ];
  const [selectedTags, setSelectedTags] = useState('DEBUG');

  const handleChange = (label, checked) => {
    console.log('You are interested in: ', label);
    if (checked) {
      setSelectedTags(label);
    }
  };

  return (
    <div className={className}>
      {tagsFromServer.map(({ label, icon, fill }) => (
        <CheckableTag
          key={label}
          checked={selectedTags === label}
          onChange={checked => handleChange(label, checked)}
        >
          <Icon type={icon} style={{ color: fill }} />
          <span className={`${className}-label`}>{label}</span>
        </CheckableTag>
      ))}
    </div>
  );
};

export default tages;
