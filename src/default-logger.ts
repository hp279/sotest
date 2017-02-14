'use strict'

import {ILogger} from 'i-logger';

export default class DefaultAsyncFunctionsExecutorLogger implements ILogger {
    public log(message: string) {
        console.log(message);
    }
}
