import('webpack1/sum').then((Module) => {
    const sum = Module.default
    // const sum = Module.default(1,2);
    console.log(sum(1,2))
}).catch((e)=> {
    console.error(e,'eeeee')
});