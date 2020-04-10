import { updateAIHintList } from '../../../reduxActions';

export const traverseCards = (cards, callback) => {
  for (const child of cards) {
    if (child.children) {
      traverseCards(child.children, callback);
    } else if (child.ifChildren) {
      traverseCards(child.ifChildren, callback);
    } else if (child.elseChildren) {
      traverseCards(child.elseChildren, callback);
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
      if (output.paramType && Array.isArray(output.paramType)) {
        if (output.paramType.find(Array.isArray)) {
          if (output.value) {
            const tempOutput = output.value.replace(/\(|\)/g, '');
            const variableList = tempOutput.split(',');
            if (tempOutput && variableList.length) {
              output.isMutiply = true;
              output.paramType.forEach((item, index) => {
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
          output.paramType.forEach(type => {
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

  console.log(aiHintList);

  updateAIHintList(aiHintList);
};
