import { useEffect, useState } from 'react';

export default card => {
  const [desc, setDesc] = useState(card.cmdDesc);
  useEffect(() => {
    card._cmdDesc = card.cmdDesc;
    Object.defineProperty(card, 'cmdDesc', {
      get() {
        return this._cmdDesc;
      },
      set(value) {
        this._cmdDesc = value;
        setDesc(value);
      },
    });
  }, []);
  return desc;
};
