'use strict'

import * as _ from 'lodash';
import ILogger from 'i-logger';
import DefaultAsyncFunctionsExecutorLogger from 'i-logger';

export default class AsyncFunctionsExecutor {
    private logger;

    constructor(customLogger: ILogger) {
        if (customLogger == null) {
            this.logger = new DefaultAsyncFunctionsExecutorLogger();
        } else {
            this.logger = customLogger;
        }
    }

    public waitForAll(array) {
        const self = this;
        let count: number = 0;

        const start = new Date().getTime();
        const originalSetTimeout = window.setTimeout;

        let waitFor = [];

        window.setTimeout = (callback, delay) => {
            const promiseIndex = count++;
            const promise = new Promise((resolve, reject) => {
                originalSetTimeout(() => {
                    debugger;
                    self.logger.log(`it is custom setTimeout <b>${promiseIndex}</b>`);
                    try {
                        callback();
                    } finally {
                        self.logger.log(`<span style="color: blue"><b>${promiseIndex}</b> resolved NOW!</span>`);
                        resolve(promiseIndex);
                    }
                }, delay);
            })
            self.logger.log(`<span style="color: red">${promiseIndex} promise was created NOW!</span><br><small>${callback}</small>`);
            waitFor.push({promiseIndex: promiseIndex, promise: promise});
        }

        !function (send) {
            XMLHttpRequest.prototype.send = function (data) {
                const xhr = this;

                !function (onreadystatechange) {
                    xhr.onreadystatechange = function (a) {
                        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                            const promiseIndex = count++;
                            const promise = new Promise((resolve, reject) => {
                                self.logger.log(
                                    `It is custom onreadystatechange resolved <b>${promiseIndex}</b> ${ xhr.responseURL}`);
                                try {
                                    onreadystatechange.call(this, a);
                                } finally {
                                    self.logger.log(`<span style="color: blue">${promiseIndex} resolved NOW!</span>`);
                                    resolve(promiseIndex);
                                }
                            })
                            self.logger.log(`<span style="color: blueviolet">${promiseIndex} promise was created NOW!</span>`);
                            waitFor.push({promiseIndex: promiseIndex, promise: promise});
                        } else {
                            onreadystatechange.call(this, a);
                        }

                    }
                }(xhr.onreadystatechange);

                !function (onerror) {
                    xhr.onerror = function (a) {
                        const promiseIndex = count++;
                        const promise = new Promise((resolve, reject) => {
                            self.logger.log(
                                `It is custom onreadystatechange rejected <b>${promiseIndex}</b> ${ xhr.responseURL}`);
                            try {
                                onerror.call(this, a);
                            } finally {
                                self.logger.log(`<span style="color: blue"><b>${promiseIndex}</b> resolved NOW!</span>`);
                                resolve(promiseIndex);
                            }
                        })
                        self.logger.log(`<span style="color: darkmagenta">${promiseIndex} promise was created NOW!</span>`);
                        waitFor.push({promiseIndex: promiseIndex, promise: promise});
                    }
                }(xhr.onreadystatechange);

                send.call(xhr, data);
            }
        }(XMLHttpRequest.prototype.send);

        const waitSetTimeOuts = () => {
            return Promise.all(_.map(waitFor, 'promise')).then((promiseIndexes) => {
                self.logger.log('<b>Result of Promise.all calling:</b>');
                _.each(promiseIndexes, (promiseIndex) => {
                    self.logger.log(
                        `Promise with index <b>${promiseIndex}</b> was resolved!`);
                })

                console.log(waitFor);
                waitFor = _.filter(waitFor, (promiseEl) => {
                    return promiseIndexes.indexOf(promiseEl.promiseIndex) === -1;
                })
                console.log(waitFor);
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
