import { useEffect, useState } from 'react';

export default card => {
  /*111*/
  const [desc, setDesc] = useState(card._userDesc);
  useEffect(() => {
    const descriptor = Object.getOwnPropertyDescriptor(card, 'userDesc');
    if (!card || card._userDesc || (descriptor && descriptor.get)) return;
    card._userDesc = card.userDesc;
    Object.defineProperty(card, 'userDesc', {
      get() {
        return this._userDesc;
      },
      set(value) {
        this._userDesc = value;
        setDesc(value);
      },
    });
  }, []);
  return desc;
};
