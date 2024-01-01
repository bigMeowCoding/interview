function funcParticle(fn,...defaultArgs) {
  return function partial(...args) {
    args=defaultArgs.concat(args)
    const ctx = this;
    if (args.length >= fn.length) {
      return fn.apply(ctx,args );
    } else {
      return partial.bind(ctx, ...args);
    }
  };
}
function sum(a,b) {
    return a+b
}
let sump= funcParticle(sum,1)
// let sump = sum.bind(this,2);
sump=sump(4,3)
// sump=sump()
console.log(sump)
