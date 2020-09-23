{types.reduce((pre,type) => {
    if (item[type]) {
      return [...pre, ...item[type].map((item2, index2) =>
        callback(item2, index+`-`+index2, get_debug_left_data_children_block)
      )];
    }else{
      return pre;
    }
  }, [])}



  return (
    <TreeNode
      title={item.userDesc ? item.userDesc : item.cmdName}
      key={`${index}`}
      // disabled={
      //   debug_dataStore.stepLog
      //     ? debug_dataStore.stepLog[index]
      //       ? false
      //       : true
      //     : true
      // }
    >
      {types.reduce((pre, type) => {
        if (item[type]) {
          console.log(`item${type}`, item[type]);
          const nextLevel = item[type].map((item2, index2) =>
            callback(
              item2,
              index + `-` + index2,
              get_debug_left_data_children_block
            )
          );
          console.log(`nextLevel`, nextLevel);
          // if (nextLevel.length > 0) {
          //   return nextLevel;
          // }
          //  else {
          //   return pre;
          // }
        } else {
          return pre;
        }
      }, [])}
    </TreeNode>
  );



    {/**
                      debug_left_data
                        ? debug_left_data.map((item, index) => {
                            return get_debug_left_data_children_block(
                              item,
                              index,
                              get_debug_left_data_children_block
                            );
                          })
                        : ''
                       */}



                         // 第二层debug的树结构构造
      const get_debug_left_data_children_block = (item, index, callback) => {
        console.log(`debug_left_data`, item, index);
        if (item.$$typeof === 0 || item.$$typeof === 1) {
          return (
            <TreeNode
              title={item.userDesc ? item.userDesc : item.cmdName}
              key={`${index}`}
              isLeaf
              // disabled={
              //   debug_dataStore.stepLog
              //     ? debug_dataStore.stepLog[index]
              //       ? false
              //       : true
              //     : true
              // }
            />
          );
        } else if (
          item.$$typeof === 2 ||
          item.$$typeof === 4 ||
          item.$$typeof === 7
        ) {
          return (
            <TreeNode
              title={item.userDesc ? item.userDesc : item.cmdName}
              key={`${index}`}
              // disabled={
              //   debug_dataStore.stepLog
              //     ? debug_dataStore.stepLog[index]
              //       ? false
              //       : true
              //     : true
              // }
            >
              {types.reduce((pre, type) => {
                console.log(type, pre, item[type]);
                if (item[type]) {
                  let temp = [...pre];

                  item[type].map((item2, index2) => {
                    const next = callback(
                      item2,
                      `${index}-${index2}`,
                      callback
                    );
                    if (next) {
                      temp.push(next);
                    }
                  });
                  // nextLevel2 = nextLevel2.filter(item => item !== undefined);
                  // console.log(
                  //   <TreeNode title={type} key={index + type}></TreeNode>
                  // );

                  return temp;
                } else {
                  return pre;
                }

                // if (item[type]) {
                //   console.log('我们要把这一层拆了', item[type]);
                //   const nextLevel = get_debug_left_data_children_block(
                //     item[type],
                //     index,
                //     get_debug_left_data_children_block
                //   );
                //   console.log('拆完之后', nextLevel);

                //   return [...pre, ...nextLevel];
                // } else {
                //   return pre;
                // }
              }, [])}
            </TreeNode>
          );
        } else {
          return [];
        }
      };



      {currentPagePosition === 'editor'
      ? debug_left_data
        ? debug_left_data.map((item, index) => {
            return (
              <TreeNode
                title={item.titleName}
                key={`${index}`}
                isLeaf
                disabled={item.hasLog ? false : true}
              />
            );
          })
        : ''
      : ''}

    {currentPagePosition === 'block' ? (
      <Tree onSelect={onSelect} treeData={debug_left_data} />
    ) : (
      ''
    )}
