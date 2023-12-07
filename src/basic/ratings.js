/**
 *
 * 移动面试题
 */
function ratings(persons) {
    function shouldGetMore(i) {
        const leftPerson = i>0?persons[i-1]:Number.POSITIVE_INFINITY;
        const rightPerson = i<persons.length-1?persons[i+1]:Number.POSITIVE_INFINITY;
        return persons[i]>leftPerson|| persons[i]>rightPerson
    }
    let dp= new Array(persons.length).fill(1)
    for(let i=0;i<dp.length;i++) {
        if(shouldGetMore(i)) {
            dp[i]+=1
        }
    }
    return dp
}
console.log(ratings([1,0,2]))
console.log(ratings([1,2,2]))