// 把层叠卡片扯出来
let temp;
export const fetchCard = (cards, fetchId) =>{
  temp = undefined;
  cards.forEach(card=>{
    // 假如找到了，则不运行了
    if(temp) return;

    if(card.id === fetchId){
      return temp = card
    }else if(card.children){
      fetchCard(card.children, fetchId);
    }
  })

  return temp;
}
