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

    waitForAll(array) {
        const self = this;
        let count: number = 0;

        const start = new Date().getTime();
        const originalSetTimeout = window.setTimeout;

        let waitFor = [];

        window.setTimeout = (callback, delay) => {
            const promiseIndex = count++;
            const promise = new Promise((resolve, reject) => {
                originalSetTimeout(() => {
                    self.logger.log('it is custom setTimeout ' + promiseIndex);
                    callback();
                    resolve(promiseIndex);
                }, delay);
            })

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
                                    `It is custom onreadystatechange resolved  ${promiseIndex} ${ xhr.responseURL}`);
                                onreadystatechange.call(this, a);
                                resolve(promiseIndex);
                            })
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
                                `It is custom onreadystatechange rejected  ${promiseIndex} ${ xhr.responseURL}`);
                            onerror.call(this, a);
                            resolve(promiseIndex);
                        })
                        waitFor.push({promiseIndex: promiseIndex, promise: promise});
                    }
                }(xhr.onreadystatechange);

                send.call(this, data);
            }
        }(XMLHttpRequest.prototype.send);

        const waitSetTimeOuts = () => {
            return Promise.all(_.map(waitFor, 'promise')).then((values) => {
                self.logger.log(values);
                waitFor = _.filter(waitFor, (promiseEl) => {
                    return values.indexOf(promiseEl.promiseIndex) === -1;
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
