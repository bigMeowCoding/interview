function combinationSum2(candidates: number[], target: number): number[][] {
    console.log(candidates.length,'llll')
    const result = [],cache=new Map();
    candidates.sort()
    function track(candis,num,path) {
            if(num<0) {
            return
        }
        const strPath = path.join('')

        if(num ===0 && !cache.has(strPath)) {
            result.push(path)
            cache.set(strPath,true)
            return
        }

     for(let i=0;i<candis.length;i++) {
         let newArr= candis.slice(i+1)
        track(newArr,num-candis[i],path.concat(candis[i]))
     }
    }
    track(candidates,target,[])
    return result
};
// let res=combinationSum2([1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],27)
// console.log(res,'rrrr')
const num = 1000000
function getRandomInt(num) {
    return  Math.floor(Math.random()*(num+1))
}
console.log('start')
for(let i =1;i<num;i++) {
    const int = getRandomInt(4)
    if(int===0) {
        console.log('get====',int)
    }
}
console.log('done')