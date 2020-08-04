import { useEffect, useState } from 'react';

export default card => {
  /*111*/
  const [desc, setDesc] = useState(card._userDesc);
  useEffect(() => {
    const descriptor = Object.getOwnPropertyDescriptor(card, 'userDesc');
    if (!card) return;
    card.userDesc = card.userDesc || '';
    card._userDesc = card.userDesc;
    try {
      Object.defineProperty(card, 'userDesc', {
        get() {
          return card._userDesc;
        },
        set(value) {
          card._userDesc = value;
          setDesc(value);
        },
      });
    } catch (err) {
      console.log(err);
      card = { ...card };
    }
    return () => {
      card = { ...card };
    };
  }, [card, setDesc]);
  return desc;
};
