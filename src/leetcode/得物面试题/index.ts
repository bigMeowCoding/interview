// 题目描述 实现一个函数，从第一个参数，整数数组中，找到所有的组合, 并按照数组的长度有小到大的顺序
// 使得每个数组相加的值都等于第二个参数的值
// 输入[1,2,3,4,5], 6    -> 输出 [[1,5], [2,4]，[1,2,3]]
// 输入[1,3], 6    -> 输出 []
function getAllArrays(array, value) {
  /**
   * 此处写代码逻辑
   */
  let result:number[][] = [];

  function backTrack(arr, value, path) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === value) {
        result.push(path.concat(arr[i]));
      } else {
        const remain = value-arr[i];
        if(remain>0) {
          const newArr=arr.slice(i+1)
          backTrack(newArr,remain,path.concat(arr[i]))
        }
      }
    }
  }

  backTrack(array, value, []);

  return result;
}
const result1 = getAllArrays([1, 2, 3, 4, 5], 6);
const result2 = getAllArrays([1,  3], 6);
console.log(result1, result2);
