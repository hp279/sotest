'use strict'

console.log('main.js loaded');

const debugHtml = [];

const log = function (msg) {
    console.log(msg);
    debugHtml.push(msg);
}

const error = function (msg) {
    console.error(msg);
    debugHtml.push(msg);
}

class SampleFunctions {
    constructor() {
    }

    func1(arr) {
        log('func1: simple setTimeout in the loop');
        [1, 2, 3].forEach(function (index) {
            setTimeout(() => {
                let greet = arr[Math.floor(Math.random() * arr.length)];
                log(greet);
            }, index * 1000);
        })

    }

    func2() {
        log('func2: nested setTimeout');
        setTimeout(() => {
            log('func 2 1!')
            setTimeout(() => {
                log('func 2 2!');
                setTimeout(() => {
                    log('func 2 3!');
                }, 1000);
            }, 1000);
        }, 1000);
    }

    func3() {
        log('func3: promise');
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                log('func 3 1!');
                resolve();
            }, 1000);
        }).then(() => {
            log('func 3 2!');
        })
    }

    func4() {
        log('func4: xhr');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts', true);

        xhr.onreadystatechange = function () {
            if (xhr.status != 200) {
                error(xhr.status + ': ' + xhr.statusText);
            } else {
                log(xhr.responseText);
            }
        }

        xhr.send(null);
    }

    func5() {
        log('func5: sync function');
        let sum = 0;
        for (let i = 0; i < 50000; i++) {
            sum += Math.random();
        }
        log('func5 end');
    }

    funcArray() {
        let result = [];
        result.push(this.func1.bind(this, ['Hello', 'Bonjour', 'Guten Tag']));
        result.push(this.func2);
        result.push(this.func3);
        result.push(this.func4);
        result.push(this.func5);

        return result;
    }
}

class AsyncFunctionsExecutor {

    constructor() {
    }

    waitForAll(array) {
        const originalSetTimeout = window.setTimeout;
        const waitForTimeOuts = [];

        window.setTimeout = (callback, delay) => {
            waitForTimeOuts.push(new Promise((resolve, reject) => {
                    originalSetTimeout(() => {
                        log("It is custom setTimeout");
                        callback();
                        resolve();
                    }, delay);
                }
            ));
        }

        const arrayToExecute = array.map((toExecute) => {
            if (!!toExecute() && (typeof toExecute() === 'object' || typeof toExecute() === 'function') && typeof toExecute().then === 'function') {
                return toExecute;
            } else {
                return new Promise((resolve) => {
                    toExecute()
                    resolve();
                })
            }
        })

        let commonLength = 0;

        let result = (_waitForTimeOuts) => {
            commonLength += _waitForTimeOuts.length;
            return Promise.all(array.concat(_waitForTimeOuts)).then(() => {
                if (commonLength < waitForTimeOuts.length) {
                    return result([].concat(waitForTimeOuts.filter((i) => {
                        return _waitForTimeOuts.indexOf(i) < 0;
                    })));
                }
            });
        }

        return result([].concat(waitForTimeOuts)).then(() => {
            window.setTimeout = originalSetTimeout;
            setTimeout(function () {
                log("It is original settimeout");
            }, 100)
        })
    }
}

window.onload = function () {
    const sampleFunctions = new SampleFunctions();
    const functionsExecutor = new AsyncFunctionsExecutor();

    functionsExecutor.waitForAll(sampleFunctions.funcArray()).then(() => {
        log('Completed!');
        let resultHtml = '';
        debugHtml.forEach((msg) => {
            resultHtml += '<p>' + msg + '</p>';
        })
        document.getElementById("result").innerHTML = resultHtml;
    })
};