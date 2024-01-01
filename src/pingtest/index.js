const ping = function () {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), Math.random() * 1000)
    })
}

//现在需要你写一个pingTest方法，每隔5秒调用这个ping方法，在ping响应之前不会重复调用，
// 并打印出每次ping方法响应的时间，并且这个pingTest方法返回一个abort方法，abort方法可以停止这个调用
const pingTest = function (cb, ms = 5000) {
    let timer = null;

    function abort() {
        if (timer) {
            clearTimeout(timer)
        }
    }

    if (timer) {
        return
    }

    function log() {
        let times = new Date().getTime()
        cb().then(() => {
            console.log('响应时间======', new Date().getTime()-times)
            timer = setTimeout(log, ms)
        })
    }

    timer = setTimeout(() => {
        log()
    }, ms)

    return {
        abort
    }
}

pingTest(ping)
