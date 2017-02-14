'use strict'

export interface ILogger {
    log(message: string): void;
}

export default class DefaultAsyncFunctionsExecutorLogger implements ILogger {
    public log(message: string) {
        console.log(message);
    }
}
