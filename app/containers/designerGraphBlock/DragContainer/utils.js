import { updateAIHintList } from '../../reduxActions';

export const traverseCards = (cards, callback) => {
  for (const child of cards) {
    if (child.children) {
      traverseCards(child.children, callback);
    } else if (child.ifChildren) {
      traverseCards(child.ifChildren, callback);
      traverseCards(child.elseChildren, callback);
    } else if (child.tryChildren) {
      traverseCards(child.tryChildren, callback);
      traverseCards(child.catchChildren, callback);
      traverseCards(child.finallyChildren, callback);
    } else {
      callback && callback(child);
    }
  }
};

export const traverseAllCards = (cards, callback) => {
  for (const child of cards) {
    if (child.children) {
      callback && callback(child);
      traverseAllCards(child.children, callback);
    } else if (child.ifChildren) {
      callback && callback(child);
      traverseAllCards(child.ifChildren, callback);
      traverseAllCards(child.elseChildren, callback);
    } else if (child.tryChildren) {
      traverseAllCards(child.tryChildren, callback);
      traverseAllCards(child.catchChildren, callback);
      traverseAllCards(child.finallyChildren, callback);
    } else {
      callback && callback(child);
    }
  }
};

export const changeAIHintList = cards => {
  const aiHintList = {};
  traverseCards(cards, node => {
    let output;
    if (
      node.properties &&
      node.properties.required &&
      (output = node.properties.required.find(item => item.enName === 'outPut'))
    ) {
      const paramType = output.paramType;
      if (paramType && Array.isArray(paramType)) {
        if (paramType.find(Array.isArray)) {
          if (output.value) {
            const tempOutput = output.value.replace(/\(|\)/g, '');
            const variableList = tempOutput.split(',');
            if (tempOutput && variableList.length) {
              output.isMutiply = true;
              paramType.forEach((item, index) => {
                item.forEach(type => {
                  if (!aiHintList[type]) {
                    aiHintList[type] = [output];
                  } else {
                    if (
                      !aiHintList[type].filter(item => item === output).length
                    ) {
                      aiHintList[type].push(output);
                    }
                  }
                });
              });
            }
          }
        } else {
          paramType.forEach(type => {
            if (!aiHintList[type]) {
              aiHintList[type] = [output];
            } else {
              if (!aiHintList[type].filter(item => item === output).length) {
                aiHintList[type].push(output);
              }
            }
          });
        }
      }
    }
  });

  updateAIHintList(aiHintList);
};

export const propagateIgnoreChange = (pendingList, ignore) => {
  traverseAllCards(pendingList, node => {
    if (node.ignore !== ignore) {
      node.hasModified = true;
    }
    node.ignore = ignore;
  });
};

export const setNodeIgnore = (cards, id) => {
  for (const child of cards) {
    if (child.children) {
      child.children.forEach(item => {
        if (item.id === id) {
          item.ignore = child.ignore;
        } else {
          setNodeIgnore(child.children, id);
        }
      });
    } else if (child.ifChildren) {
      child.ifChildren.forEach(item => {
        if (item.id === id) {
          item.ignore = child.ignore;
        } else {
          setNodeIgnore(child.ifChildren, id);
        }
      });
      child.elseChildren.forEach(item => {
        if (item.id === id) {
          item.ignore = child.ignore;
        } else {
          setNodeIgnore(child.elseChildren, id);
        }
      });
    } else if (child.tryChildren) {
      child.tryChildren.forEach(item => {
        if (item.id === id) {
          item.ignore = child.ignore;
        } else {
          setNodeIgnore(child.tryChildren, id);
        }
      });
      child.catchChildren.forEach(item => {
        if (item.id === id) {
          item.ignore = child.ignore;
        } else {
          setNodeIgnore(child.catchChildren, id);
        }
      });
      child.finallyChildren.forEach(item => {
        if (item.id === id) {
          item.ignore = child.ignore;
        } else {
          setNodeIgnore(child.finallyChildren, id);
        }
      });
    }
  }
};
