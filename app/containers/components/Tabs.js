import React from 'react';

const Tabs = ({
  onChangeFunction,
  tabDatas,
  variable,
  wrapperClass,
  linePosition,
}) => {
  return (
    <div className={wrapperClass}>
      {tabDatas.map((item, index) => {
        return (
          <div
            key={item.key}
            className={item.className}
            style={{
              color: variable === item.key ? 'rgba(50, 166, 127, 1)' : 'black',
            }}
            onClick={() => {
              onChangeFunction(item.key);
            }}
          >
            {linePosition === 'top' && (
              <div
                className="tab-line"
                style={{
                  border:
                    variable === item.key
                      ? '1px solid rgba(50, 166, 127, 1)'
                      : '1px solid white',
                }}
              ></div>
            )}

            <div className="tab-title">{item.name}</div>

            {linePosition === 'bottom' && (
              <div
                className="tab-line"
                style={{
                  border:
                    variable === item.key
                      ? '1px solid rgba(50, 166, 127, 1)'
                      : '1px solid white',
                }}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;
