export function permute(nums: number[]): number[][] {
  let ret = [];
  backTrack([]);
  function backTrack(path) {
    if(path){
      
      
    }
    if (path.length === nums.length) {
      ret.push(path);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (path.includes(nums[i])) continue;
      const newPath = path.slice(0);
      newPath.push(nums[i]);
      backTrack(newPath);
    }
  }
  return ret;
}
