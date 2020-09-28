import React, { useEffect, useState, useRef } from "react";

import InputComponent from "./Input/ModelPanel";
// import ChooseImageComponent from './components/ChooseImage/ModelPanel';
// import RadioComponent from './components/Radio/ModelPanel';
// import InputPanel from './components/Input/EditPanel';
import SelectComponent from "./Select/ModelPanel";
import SubmitButtonComponent from "./Button/index";
import UploadComponent from "./Upload/index";
// import TextareaComponent from './components/Textarea/ModelPanel';
// import DateComponent from './components/Date/ModelPanel';
import ImageComponent from "./Image/ModelPanel";
import UploadImagesComponent from "./UploadImages/index";

// export default props => {
//     switch (props.type) {
//         case INPUT_COMPONENT:
//             return (
//                 <InputPanel
//                     focusItemId={this.state.focusItemId}
//                     focusItem={handleFocusItem}
//                     callback={() => this.callback()}
//                 />
//             );
//     }
// };

import {
  INPUT_COMPONENT,
  RADIO_COMPONENT,
  IMAGE_COMPONENT,
  SUBMIT_COMPONENT,
  UPLOAD_COMPONENT,
  DOWNLOAD_COMPONENT,
  SELECT_COMPONENT,
  UPLOADIMAMGS_COMPONENT,
  CANCEL_COMPONENT,
} from "./componentTypes";

export default ({
  width,
  id,
  dataList,
  focusItemId,
  setFocusItemId,
  setDataList,
  deleteLayoutCellById,
  moveUp,
  moveDown,
}) => {
  const item = dataList.find((item) => item.id === id);

  const showItem = () => {
    switch (item.type) {
      case INPUT_COMPONENT:
        return (
          <InputComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );
      case SELECT_COMPONENT:
        return (
          <SelectComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );
      case SUBMIT_COMPONENT:
        return (
          <SubmitButtonComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );
      case CANCEL_COMPONENT:
        return (
          <SubmitButtonComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );
      case UPLOAD_COMPONENT:
        return (
          <UploadComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );
      case DOWNLOAD_COMPONENT:
        return (
          <UploadComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );
      case IMAGE_COMPONENT:
        return (
          <ImageComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );
      case UPLOADIMAMGS_COMPONENT:
        return (
          <UploadImagesComponent
            width={width}
            focusItemId={focusItemId}
            setFocusItemId={setFocusItemId}
            item={item}
            setDataList={setDataList}
            handleDeleteComponent={deleteLayoutCellById}
            moveUp={moveUp}
            moveDown={moveDown}
          />
        );

      default:
        break;
    }
  };

  return <>{showItem()}</>;
};
