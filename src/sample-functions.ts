'use strict'

import ILogger from 'i-logger';
import DefaultAsyncFunctionsExecutorLogger from 'i-logger';

export default class SampleFunctions {
    private logger;

    public constructor(customLogger: ILogger) {
        if (customLogger == null) {
            this.logger = new DefaultAsyncFunctionsExecutorLogger();
        } else {
            this.logger = customLogger;
        }
    }

    private func1(arr) {
        const self = this;
        self.logger.log('func1: simple setTimeout in the loop');
        [1, 2, 3].forEach(function (index) {
            setTimeout(() => {
                let greet = arr[Math.floor(Math.random() * arr.length)];
                self.logger.log(greet);
            }, index * 1000);
        })
    }

    private func2() {
        const self = this;
        self.logger.log('func2: nested setTimeout');
        setTimeout(() => {
            self.logger.log('func 2 1!')
            setTimeout(() => {
                self.logger.log('func 2 2!');
                setTimeout(() => {
                    self.logger.log('func 2 3!');
                }, 1000);
            }, 1000);
        }, 1000);
    }

    private func3() {
        const self = this;
        self.logger.log('func3: promise');
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                self.logger.log('func 3 1!');
                resolve();
            }, 1000);
        }).then(() => {
            self.logger.log('func 3 2!');
        })
    }

    private func4() {
        const self = this;
        self.logger.log('func4: xhr');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://jsonplaceholder.typicode.com/posts', true);

        xhr.onreadystatechange = function () {
            if (xhr.status !== 200) {
                self.logger.log(xhr.status + ': ' + xhr.statusText);
            } else {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    setTimeout(function () {
                        self.logger.log('func 4 1!');
                        const toShow = 1000;
                        self.logger.log(xhr.responseText.substring(0, toShow) +
                            (xhr.responseText.length > toShow ? '...' : ''));
                    }, 2000);
                }
            }
        }

        xhr.onerror = function (e) {
            self.logger.log(e);
        };

        try {
            setTimeout(function () {
                xhr.send(null);
            }, 2000);
        } catch (e) {
            self.logger.log(`Error: ${e}`);
        }
    }

    private func5() {
        const self = this;
        self.logger.log('func5: sync function');
        let sum = 0;
        for (let i = 0; i < 50000; i++) {
            sum += Math.random();
        }
        self.logger.log('func5 end');
    }

    private func6() {
        const self = this;
        self.logger.log('func6: func with error');
        return 6 / 0;
    }

    private func7() {
        const self = this;
        self.logger.log('func7: func with rejection');
        return Promise.reject(new Error('func 7 : reject')).then((success) => {
        }, (error) => {
            self.logger.log(error);
        })
    }

    private func8() {
        const self = this;
        self.logger.log('func8: xhr error');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://badaddress.com/posts', true);

        xhr.onreadystatechange = function () {
            if (xhr.status !== 200) {
                self.logger.log(`Error: ${xhr.status}: ${xhr.statusText}`);
            } else {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    const toShow = 1000;
                    self.logger.log(xhr.responseText.substring(0, toShow) +
                        (xhr.responseText.length > toShow ? '...' : ''));
                }
            }
        }

        xhr.send(null);
    }

    public funcArray() {
        const fns = [];
        fns.push(this.func1.bind(this, ['Hello', 'Bonjour', 'Guten Tag']));
        fns.push(this.func2.bind(this));
        fns.push(this.func3.bind(this));
        fns.push(this.func4.bind(this));
        fns.push(this.func5.bind(this));
        fns.push(this.func6.bind(this));
        fns.push(this.func7.bind(this));
        fns.push(this.func8.bind(this));
        return fns;
    }
}


