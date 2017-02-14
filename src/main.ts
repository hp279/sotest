'use strict'

console.log('main.js loaded');

import CustomLogger from 'logger';

import AsyncFunctionsExecutor from 'async-functions-executor';
import SampleFunctions from 'sample-functions';

window.onload = function () {
    const customLogger = CustomLogger.getInstance();
    const sampleFunctions = new SampleFunctions();
    const functionsExecutor = new AsyncFunctionsExecutor();

    functionsExecutor.waitForAll(sampleFunctions.funcArray()).then((executionTime) => {
        customLogger.log(`Completed! Execution time ${executionTime} ms`);

        let resultHtml = '';
        customLogger.getDebugHtml().forEach((msg) => {
            resultHtml += '<p style="font-size: 12px;">' + msg + '</p>';
        })

        document.getElementById('result').innerHTML = resultHtml;

        setTimeout(function () {
            console.log('It is original setTimeout');
        }, 100);
    })
};

