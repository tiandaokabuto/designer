import React from 'react';

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
          labelText="启动Ipython调试"
          iconType="play-circle"
          click={() => {
            event.emit(DEBUG_OPEN_DEBUGSERVER);
            event.emit(PYTHON_OUTPUT_CLEAR);
          }}
        />
      ) : (
        <span>
          <DebugBtn
            labelText="关闭Ipython调试"
            iconType="stop"
            click={() => {
              event.emit(DEBUG_CLOSE_DEBUGSERVER);
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
                <DebugBtn
                  labelText="从头按序调试"
                  iconType="play-circle"
                  click={() => {
                    event.emit(DEBUG_RUN_STEP_BY_STEP);
                  }}
                />
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
                      <DebugBtn
                        labelText="下一步"
                        iconType="vertical-align-bottom"
                        click={() => {
                          event.emit(DEBUG_CONTINUE_ONESTEP_NEXT);
                        }}
                      />
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
