import React, { useState } from 'react';

import { useSelector } from 'react-redux';

import event from '../../../eventCenter';
import DebugBtn from '../DebugBtn/DebugBtn';

import { PYTHON_OUTPUT, PYTHON_OUTPUT_CLEAR } from '@/containers/eventCenter';

import {
  DEBUG_OPEN_DEBUGSERVER,
  DEBUG_CLOSE_DEBUGSERVER,
  DEBUG_RUN_STEP_BY_STEP,
  DEBUG_SET_PAUSE,
  DEBUG_CONTINUE,
  DEBUG_CONTINUE_ONESTEP_NEXT,
  DEBUG_RESET_CODE,
  DEBUG_SOURCECODE_INSERT,
} from '../../../../constants/actions/debugInfos';

export default ({
  tabSwicth,
  debug_switch,
  debug_running,
  debug_oneRunning,
  debug_pause,
}) => {
  const [disabledBtn, setDisabledBtn] = useState(false);
  const currentPagePosition = useSelector(
    state => state.temporaryvariable.currentPagePosition
  );

  return (
    <div
      style={{
        marginTop: -41,
        display: tabSwicth === '调试' ? 'inline' : 'none',
      }}
      className="dragger-editor-container-output-tages"
    >
      {debug_switch === false ? (
        <DebugBtn
          labelText={disabledBtn ? '正在切换状态' : '启动调试'}
          iconType="experiment"
          disabled={disabledBtn}
          click={() => {
            setDisabledBtn(true);
            event.emit(DEBUG_OPEN_DEBUGSERVER);
            event.emit(PYTHON_OUTPUT_CLEAR);
            setTimeout(() => setDisabledBtn(false), 2800);
          }}
        />
      ) : (
        <span>
          <DebugBtn
            labelText={disabledBtn ? '关闭调试' : '关闭调试'}
            iconType="experiment"
            disabled={disabledBtn}
            click={() => {
              setDisabledBtn(true);
              event.emit(DEBUG_CLOSE_DEBUGSERVER);
              setTimeout(() => setDisabledBtn(false), 2800);
            }}
          />
        </span>
      )}

      {/** DEBUG服务器开启后，这些按钮才出现 */}
      {debug_switch === false ? (
        ''
      ) : (
        <span>
          {/** 单步调试时，上述所有的按钮都不能显示 */}
          {debug_oneRunning === true ? (
            <DebugBtn
              labelText="正在进行单步调试"
              iconType="loading"
              disabled={true}
            />
          ) : (
            <span>
              {/** 没有操作时，可以进行按序调试 */}
              {debug_running === false ? (
                <span>
                  <DebugBtn
                    labelText="运行"
                    iconType="play-circle"
                    click={() => {
                      event.emit(DEBUG_RUN_STEP_BY_STEP);
                    }}
                  />
                  {currentPagePosition === 'block' ? (
                    <DebugBtn
                      labelText="下一步"
                      iconType="vertical-align-bottom"
                      click={() => {
                        event.emit(DEBUG_RUN_STEP_BY_STEP);
                        event.emit(DEBUG_SET_PAUSE);
                      }}
                    />
                  ) : (
                    ''
                  )}
                </span>
              ) : (
                <span>
                  {debug_pause === false ? (
                    <DebugBtn
                      labelText="暂停"
                      iconType="loading"
                      click={() => {
                        event.emit(DEBUG_SET_PAUSE);
                      }}
                    />
                  ) : (
                    <span>
                      <DebugBtn
                        labelText="继续"
                        iconType="play-circle"
                        click={() => {
                          event.emit(DEBUG_CONTINUE);
                        }}
                      />
                      {currentPagePosition === 'block' ? (
                        <DebugBtn
                          labelText="下一步"
                          iconType="vertical-align-bottom"
                          click={() => {
                            event.emit(DEBUG_CONTINUE_ONESTEP_NEXT);
                          }}
                        />
                      ) : (
                        ''
                      )}
                      <DebugBtn
                        labelText="重新生成代码"
                        iconType="issues-close"
                        click={() => {
                          resetDebugIndex();
                          event.emit(DEBUG_RESET_CODE);
                        }}
                      />
                    </span>
                  )}
                </span>
              )}
            </span>
          )}
        </span>
      )}
    </div>
  );
};
