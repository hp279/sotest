'use strict'

console.log('main.js loaded');

const debugHtml = [];

const log = function (msg) {
    console.log(msg);
    debugHtml.push(msg);
}

const printError = function (msg) {
    console.log(`Error: ${msg}`);
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
            if (xhr.status !== 200) {
                printError(xhr.status + ': ' + xhr.statusText);
            } else {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    setTimeout(function () {
                        log('func 4 1!');
                        const toShow = 1000;
                        log(xhr.responseText.substring(0, toShow) + (xhr.responseText.length > toShow ? '...' : ''));
                    }, 2000);
                }
            }
        }

        xhr.onerror = function (e) {
            printError(e);
        };

        try {
            xhr.send(null);
        } catch (e) {
            printError(`Error: ${e}`);
        }
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
    }

    func7() {
        log('func7: func with rejection');
        return Promise.reject(new Error('func 7 : reject')).then((success) => {
        }, (error) => {
            printError(error);
        })
    }

    func8() {
        log('func8: xhr error');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://badaddress.com/posts', true);

        xhr.onreadystatechange = function () {
            if (xhr.status !== 200) {
                printError(`Error: ${xhr.status}: ${xhr.statusText}`);
            } else {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    const toShow = 1000;
                    log(xhr.responseText.substring(0, toShow) + (xhr.responseText.length > toShow ? '...' : ''));
                }
            }
        }

        try {
            xhr.send(null);
        } catch (e) {
            printError(`Error: ${e}`);
        }
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
        //fns.push(this.func8);
        return fns;
    }
}

class AsyncFunctionsExecutor {
    waitForAll(array) {
        const start = new Date().getTime();
        const originalSetTimeout = window.setTimeout;
        const origXHROpen = XMLHttpRequest.prototype.open;

        const waitFor = [];

        window.setTimeout = (callback, delay) => {
            const promise = new Promise((resolve, reject) => {
                originalSetTimeout(() => {
                    log('It is custom setTimeout');
                    callback();
                    waitFor.splice(waitFor.indexOf.bind(null, promise), 1);
                    resolve();
                }, delay);
            })

            waitFor.push(promise);
        }

        XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
            return origXHROpen.call(this, method, url, false, user, password);
        };

        const waitSetTimeOuts = () => {
            return Promise.all(waitFor).then(() => {
                if (waitFor.length > 0) {
                    return waitSetTimeOuts();
                }
            });
        }

        array.forEach((toExecute) => {
            toExecute();
        })

        const revertOrigins = () => {
            window.setTimeout = originalSetTimeout;
            XMLHttpRequest.prototype.open = origXHROpen;
        }

        return waitSetTimeOuts().then(() => {
            return Promise.all(array).then(() => {
                revertOrigins();
                return (new Date().getTime() - start);
            })
        }).catch(function (error) {
            revertOrigins();
        });
    }
}

window.onload = function () {
    const sampleFunctions = new SampleFunctions();
    const functionsExecutor = new AsyncFunctionsExecutor();

    functionsExecutor.waitForAll(sampleFunctions.funcArray()).then((executionTime) => {
        log(`Completed! Execution time ${executionTime} ms`);

        let resultHtml = '';
        debugHtml.forEach((msg) => {
            resultHtml += '<p style="font-size: 12px;">' + msg + '</p>';
        })
        document.getElementById('result').innerHTML = resultHtml;

        setTimeout(function () {
            console.log('It is original setTimeout');
        }, 100);
    })
};
