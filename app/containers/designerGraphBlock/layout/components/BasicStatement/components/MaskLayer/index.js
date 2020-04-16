import React from 'react';
import ReactDOM from 'react-dom';

import './index.scss';

class MaskLayer extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement('div');
    this.maskRoot = null;
  }

  componentDidMount() {
    this.maskRoot = document.getElementById('fragment');
  }

  handleCilckFrangment = () => {
    this.props.handleCilckFrangment();
  };

  hideFragment = () => {
    this.maskRoot.className = '';
    this.maskRoot.removeChild(this.el);
    this.maskRoot.removeEventListener('click', this.handleCilckFrangment);
    this.maskRoot.removeEventListener('click', this.hideFragment);
  };

  showFragment = () => {
    this.maskRoot.className = 'showFragment';
    this.el.className = 'showMaskLayer';
    this.maskRoot.appendChild(this.el);
    this.maskRoot.addEventListener('click', this.handleCilckFrangment);
    this.maskRoot.addEventListener('click', this.hideFragment);
  };

  render() {
    const { children, isShow } = this.props;
    if (!isShow) return null;
    this.showFragment();
    return ReactDOM.createPortal(children, this.el);
  }
}

export default MaskLayer;
