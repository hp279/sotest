'use strict'

import CustomLogger from 'logger';
const customLogger = CustomLogger.getInstance();

export default class SampleFunctions {
    constructor() {
    }

    func1(arr) {
        customLogger.log('func1: simple setTimeout in the loop');
        [1, 2, 3].forEach(function (index) {
            setTimeout(() => {
                let greet = arr[Math.floor(Math.random() * arr.length)];
                customLogger.log(greet);
            }, index * 1000);
        })
    }

    func2() {
        customLogger.log('func2: nested setTimeout');
        setTimeout(() => {
            customLogger.log('func 2 1!')
            setTimeout(() => {
                customLogger.log('func 2 2!');
                setTimeout(() => {
                    customLogger.log('func 2 3!');
                }, 1000);
            }, 1000);
        }, 1000);
    }

    func3() {
        customLogger.log('func3: promise');
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                customLogger.log('func 3 1!');
                resolve();
            }, 1000);
        }).then(() => {
            customLogger.log('func 3 2!');
        })
    }

    func4() {
        customLogger.log('func4: xhr');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts', true);

        xhr.onreadystatechange = function () {
            if (xhr.status !== 200) {
                customLogger.printError(xhr.status + ': ' + xhr.statusText);
            } else {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    setTimeout(function () {
                        customLogger.log('func 4 1!');
                        const toShow = 1000;
                        customLogger.log(xhr.responseText.substring(0, toShow) +
                            (xhr.responseText.length > toShow ? '...' : ''));
                    }, 2000);
                }
            }
        }

        xhr.onerror = function (e) {
            customLogger.printError(e);
        };

        try {
            xhr.send(null);
        } catch (e) {
            customLogger.printError(`Error: ${e}`);
        }
    }

    func5() {
        customLogger.log('func5: sync function');
        let sum = 0;
        for (let i = 0; i < 50000; i++) {
            sum += Math.random();
        }
        customLogger.log('func5 end');
    }

    func6() {
        customLogger.log('func6: func with error');
        return 6 / 0;
    }

    func7() {
        customLogger.log('func7: func with rejection');
        return Promise.reject(new Error('func 7 : reject')).then((success) => {
        }, (error) => {
            customLogger.printError(error);
        })
    }

    func8() {
        customLogger.log('func8: xhr error');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://badaddress.com/posts', true);

        xhr.onreadystatechange = function () {
            if (xhr.status !== 200) {
                customLogger.printError(`Error: ${xhr.status}: ${xhr.statusText}`);
            } else {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    const toShow = 1000;
                    customLogger.log(xhr.responseText.substring(0, toShow) +
                        (xhr.responseText.length > toShow ? '...' : ''));
                }
            }
        }

        try {
            xhr.send(null);
        } catch (e) {
            customLogger.printError(`Error: ${e}`);
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
        fns.push(this.func8);
        return fns;
    }
}

