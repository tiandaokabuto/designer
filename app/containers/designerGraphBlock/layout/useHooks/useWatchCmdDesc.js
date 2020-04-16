import { useEffect, useState } from 'react';

export default card => {
  const [desc, setDesc] = useState(card._userDesc);
  useEffect(() => {
    const descriptor = Object.getOwnPropertyDescriptor(card, 'userDesc');
    if (!card) return;
    if (descriptor && descriptor.get) {
      Object.defineProperty(card, 'userDesc', {
        get: null,
        set: null,
      });
    }
    console.log(card);
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
  }, [card]);
  return desc;
};
