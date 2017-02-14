'use strict'

import {ILogger} from 'i-logger';

export default class CustomLogger implements ILogger {
    private static _instance: CustomLogger = new CustomLogger();

    private debugHtml;

    public static getInstance(): CustomLogger {
        return CustomLogger._instance;
    }

    private constructor() {
        if (CustomLogger._instance) {
            throw new Error("Error: Instantiation failed: Use CustomLogger.getInstance() instead of new.");
        }
        CustomLogger._instance = this;
        this.debugHtml = [];
    }

    public log(msg) {
        console.log(msg);
        this.debugHtml.push(msg);
    }

    public getDebugHtml() {
        return this.debugHtml;
    }
}

