import React, { useEffect, useRef, memo, useImperativeHandle } from 'react';
import CodeMirror from 'codemirror';
import { useDispatch, useSelector } from 'react-redux';
import uniqueId from 'lodash/uniqueId';
import useUpdateEffect from 'react-hook-easier/lib/useUpdateEffect';

import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/lint/lint.css';

import 'codemirror/lib/codemirror.js';

import 'codemirror/addon/comment/comment.js';

import 'codemirror/addon/selection/active-line.js';

import 'codemirror/keymap/sublime.js';

import 'codemirror/addon/hint/show-hint.js';
import 'codemirror/mode/python/python.js';

import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/brace-fold.js';
import 'codemirror/addon/fold/indent-fold.js';
import 'codemirror/addon/fold/comment-fold.js';

import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/edit/matchbrackets.js';

export default React.forwardRef(({ value, id, readOnly }, ref) => {
  console.log(readOnly);
  const codeMirrorRef = useRef(null);
  const dispatch = useDispatch();

  useImperativeHandle(ref, () => {
    return {
      codeMirrorRef,
    };
  });

  useEffect(() => {
    const el = document.getElementById(`editor${id || ''}`);
    const version = '# version: Python3\n\n';
    const codeAreaTip = '# please edit your code here:\n';
    const codeStart = '# code start\n\n';
    const codeEnd = '# code end\n\n';
    const codeTip =
      "'''\nThis function is the entry of this program and\nit must be return your answer of current question.\n'''\n";
    const code = 'def solution():\n\tprint("hhhh")\nsolution()';
    const initValue =
      version + codeAreaTip + codeStart + codeEnd + codeTip + code;
    const myCodeMirror = CodeMirror.fromTextArea(el, {
      mode: 'python', // 语言模式
      // theme: 'leetcode', // 主题
      keyMap: 'sublime', // 快键键风格
      lineNumbers: true, // 显示行号
      smartIndent: true, // 智能缩进
      indentUnit: 4, // 智能缩进单位为4个空格长度
      indentWithTabs: true, // 使用制表符进行智能缩进
      readOnly, // 只读
      lineWrapping: false, //
      // 在行槽中添加行号显示器、折叠器、语法检测器
      gutters: [
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter',
        'CodeMirror-lint-markers',
      ],
      foldGutter: true, // 启用行槽中的代码折叠
      autofocus: true, // 自动聚焦
      matchBrackets: true, // 匹配结束符号，比如"]、}"
      autoCloseBrackets: true, // 自动闭合符号
      styleActiveLine: true, // 显示选中行的样式
      viewportMargin: Infinity,
    });
    // 设置初始文本，这个选项也可以在fromTextArea中配置
    myCodeMirror.setOption('value', initValue);
    // myCodeMirror.on('keypress', function() {
    //   // 显示智能提示
    //   myCodeMirror.showHint(); // 注意，注释了CodeMirror库中show-hint.js第131行的代码（阻止了代码补全，同时提供智能提示）
    // });
    codeMirrorRef.current = myCodeMirror;
  }, []);

  useEffect(() => {
    codeMirrorRef.current.setOption('value', value);
  }, [value]);

  return (
    <div style={{ height: '100%' }}>
      <textarea id={`editor${id || ''}`} className={`editor${id || ''}`} />
    </div>
  );
});
