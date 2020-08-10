// 把层叠卡片扯出来
let temp;
export const fetchCard = (cards, fetchId) => {
  cards.forEach(card => {
    // 假如找到了，则不运行了
    if (temp) return;
    console.log(card.id)
    if (card.id === fetchId) {
      temp = card;
    } else if (card.children) {
      fetchCard(card.children, fetchId);
    }
  });

  console.log("最后给出temp",temp)
  return temp;
};

export const resetTemp = () =>{
  temp = undefined;
}
