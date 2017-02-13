'use strict'

console.log('main.js loaded');

const debugHtml = [];

const log = function (msg) {
    console.log(msg);
    debugHtml.push(msg);
}

const error = function (msg) {
    console.log("Error: " + msg);
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
                if (xhr.readyState === 4) {
                    const toShow = 1000;
                    log(xhr.responseText.substring(0, toShow) + (xhr.responseText.length > toShow ? '...' : ''));
                }
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

    func6() {
        log('func6: func with error');
        return 6 / 0;
        log('func6 end');
    }

    func7() {
        log('func7: func with rejection');
        return Promise.reject(new Error("func 7 : reject")).then((success) => {
        }, (error) => {
            log(error);
        })
    }

    func8() {
        log('func8: xhr error');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://badaddress.com/posts', true);

        xhr.onreadystatechange = function () {
            if (xhr.status != 200) {
                error("Error: " + xhr.status + ': ' + xhr.statusText);
            } else {
                log(xhr.responseText);
            }
        }

        xhr.send(null);
    }

    funcArray() {
        let fns = [];
        fns.push(this.func1.bind(this, ['Hello', 'Bonjour', 'Guten Tag']));
        fns.push(this.func2);
        fns.push(this.func3);
        fns.push(this.func4);
        fns.push(this.func5);
        fns.push(this.func6);
        fns.push(this.func7);
        // fns.push(this.func8);
        return fns;
    }
}

class AsyncFunctionsExecutor {
    waitForAll(array) {
        const originalSetTimeout = window.setTimeout;

        const waitFor = [];

        window.setTimeout = (callback, delay) => {
            var promise = new Promise((resolve, reject) => {
                originalSetTimeout(() => {
                    log("It is custom setTimeout");
                    callback();
                    waitFor.splice(waitFor.indexOf.bind(null, promise), 1);
                    resolve();
                }, delay);
            })

            waitFor.push(promise);
        }

        const waitSetTimeOuts = (_waitFor) => {
            return Promise.all(_waitFor).then(() => {
                if (waitFor.length > 0) {
                    return waitSetTimeOuts([].concat(waitFor));
                }
            });
        }

        array.forEach((toExecute) => {
            toExecute();
        })

        return waitSetTimeOuts([].concat(waitFor)).then(() => {
            window.setTimeout = originalSetTimeout;

            setTimeout(function () {
                log("It is original setTimeout");
            }, 100);
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