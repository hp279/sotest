'use strict'

import * as _ from 'lodash';
import {ILogger} from 'i-logger';
import DefaultAsyncFunctionsExecutorLogger from 'default-logger';

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
        let waitFor = [];

        const originSetTimeout = window.setTimeout;
        window.setTimeout = function (closureOrText, delay) {
            const funcArgs = [];
            for (let index = 2; index < arguments.length; index++) {
                funcArgs.push(arguments[index]);
            }
            let callback = closureOrText;
            if (arguments.length <= 2 || typeof closureOrText != "function") {
                callback = closureOrText;
            } else {
                callback = timeoutCallback(closureOrText, funcArgs);
            }

            const promiseIndex = count++;
            const promise = new Promise((resolve, reject) => {
                originSetTimeout(() => {
                    self.logger.log(`it is custom setTimeout <b>${promiseIndex}</b>`);
                    try {
                        callback();
                    } finally {
                        self.logger.log(`<span style="color: blue"><b>${promiseIndex}</b> resolved NOW!</span>`);
                        resolve(promiseIndex);
                    }
                }, delay);
            })
            self.logger.log(`<span style="color: red">${promiseIndex} promise was created NOW!</span><br><small>${closureOrText}</small>`);
            waitFor.push({promiseIndex: promiseIndex, promise: promise});
        };

        const timeoutCallback = function (closure, argArray) {
            return function () {
                closure.apply(this, argArray);
            };
        };

        !function (send) {
            XMLHttpRequest.prototype.send = function (data) {
                const xhr = this;
                const promiseIndex = count++;
                const promise = new Promise(function (resolve, reject) {
                    !function (onreadystatechange) {
                        xhr.onreadystatechange = function (a) {
                            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                                try {
                                    onreadystatechange.call(this, a);
                                } finally {
                                    self.logger.log(`<span style="color: blue">${promiseIndex} resolved NOW!</span>`);
                                    resolve(promiseIndex);
                                }
                            }
                            else {
                                try {
                                    onreadystatechange.call(this, a);
                                } catch (e) {
                                    self.logger.log(`<span style="color: darkblue">${promiseIndex} resolved (reject) NOW!</span>`);
                                    resolve(promiseIndex);
                                }
                            }

                        }
                    }(xhr.onreadystatechange);

                    !function (onerror) {
                        xhr.onerror = function (a) {
                            try {
                                onerror.call(this, a);
                            } finally {
                                self.logger.log(`<span style="color: darkblue"><b>${promiseIndex}</b> resolved (reject) NOW!</span>`);
                                resolve(promiseIndex);
                            }
                        }
                    }(xhr.onreadystatechange);

                    send.call(xhr, data);
                });

                self.logger.log(`<span style="color: blueviolet">${promiseIndex} promise was created NOW!</span>`);
                waitFor.push({promiseIndex: promiseIndex, promise: promise});
            }
        }(XMLHttpRequest.prototype.send);

        const waitSetTimeOuts = () => {
            return Promise.all(_.map(waitFor, 'promise')).then((promiseIndexes) => {
                self.logger.log('<b>Result of Promise.all calling:</b>');
                _.each(promiseIndexes, (promiseIndex) => {
                    self.logger.log(
                        `Promise with index <b>${promiseIndex}</b> was resolved!`);
                })

                waitFor = _.filter(waitFor, (promiseEl) => {
                    return promiseIndexes.indexOf(promiseEl.promiseIndex) === -1;
                })
                if (waitFor.length > 0) {
                    return waitSetTimeOuts();
                }
            });
        }

        array.forEach((toExecute) => {
            toExecute();
        })

        const revertOrigins = () => {
            window.setTimeout = originSetTimeout;
        }

        return waitSetTimeOuts().then(() => {
            revertOrigins();
            return (new Date().getTime() - start);
        }).catch(function () {
            revertOrigins();
        });
    }
}
