// 把层叠卡片扯出来
let temp;
export const fetchCard = (cards, fetchId) => {
  temp = undefined;
  cards.forEach(card => {
    // 假如找到了，则不运行了
    if (temp) return;
    console.log(card.id)
    if (card.id === fetchId) {
      temp = card;
    }
    if (card.children) {
      fetchCard(card.children, fetchId);
    }
    if (card.ifChildren) {
      fetchCard(card.ifChildren, fetchId);
    }
    if (card.elseChildren){
      fetchCard(card.elseChildren, fetchId);
    }
    if (card.tryChildren){
      fetchCard(card.tryChildren, fetchId);
    }
    if (card.catchChildren){
      fetchCard(card.catchChildren, fetchId);
    }
    if (card.finallyChildren){
      fetchCard(card.finallyChildren, fetchId);
    }
  });

  //console.log("最后给出temp",temp)
  return temp;
};

export const resetTemp = () =>{
  temp = undefined;
}
