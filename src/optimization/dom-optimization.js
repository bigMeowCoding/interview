// 1. 批量插入 DOM（DocumentFragment 减少回流）
var fragment = document.createDocumentFragment();
for (var i = 0; i < 1000; i++) {
  var item = document.createElement("li");
  item.innerText = i;
  item.dataset.index = i;
  fragment.appendChild(item);
}
document.getElementById("list").appendChild(fragment);

// 2. 事件委托：父元素统一处理子元素点击
var list = document.getElementById("list");
list.addEventListener("click", function (e) {
  var target = e.target;
  if (target.tagName === "LI") {
    alert(target.dataset.index); // 或 target.innerText
  }
});
