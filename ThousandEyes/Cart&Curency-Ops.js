/*Copyright (c) 2021, Cisco Systems, Inc. and/or its affiliates. All rights reserved. 
Licensed under the Apache 2.0 license, see LICENSE file.
*/

import { By, Key } from 'selenium-webdriver';
import { driver } from 'thousandeyes';

runScript();

async function runScript() {
    
    await configureDriver();
    
    await driver.get('<Online-Boutique-IP-Address>');

    await click(By.css(`[href="/product/L9ECAV7KIM"] > div`));

    // Click on 'ADD TO CART'
	await click(By.css(`.btn`));

    // Click on 'KEEP BROWSING'
	await click(By.css(`[role="button"]`));

    await selectOption(By.name(`currency_code`), By.css(`[value="GBP"]`));

    await click(By.css(`[href="/product/0PUK6V6EV0"] > div`));

    // Click on 'ADD TO CART'
	await click(By.css(`.btn`));

    // Click on 'KEEP BROWSING'
	await click(By.css(`[role="button"]`));

    await selectOption(By.name(`currency_code`), By.css(`[value="EUR"]`));

    await click(By.css(`[href="/product/9SIQT8TOJO"] > div`));

    // Click on 'ADD TO CART'
	await click(By.css(`.btn`));

    await click(By.css(`[href="/product/6E92ZMYYFZ"] > div`));

    // Click on 'ADD TO CART'
	await click(By.css(`.btn`));

    // Click on 'PLACE ORDER'
	await click(By.css(`.btn-info:nth-child(1)`));
    
}

async function configureDriver() {
    await driver.manage().window().setRect({ 
        width: 1200, 
        height: 917
    });
    await driver.manage().setTimeouts({
        implicit: 7 * 1000, // If an element is not found, reattempt for this many milliseconds
    });
}



async function click(selector) {
    await simulateHumanDelay();

    const configuredTimeouts = await driver.manage().getTimeouts();
    const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

    await reattemptUntil(attemptToClick, clickAttemptEndTime);
    
    async function attemptToClick() {
        await driver.findElement(selector)
                    .click();
    }
}

async function reattemptUntil(attemptActionFn, attemptEndTime) {
    const TIME_BETWEEN_ATTEMPTS = 100;
    let numberOfAttempts = 0;
    let attemptError;
    while (Date.now() < attemptEndTime || numberOfAttempts === 0) {
        try {
            numberOfAttempts += 1;
            await attemptActionFn();
        }
        catch (error) {
            attemptError = error;
            await driver.sleep(TIME_BETWEEN_ATTEMPTS);
            continue; // Attempt failed, reattempt
        }
        attemptError = null;
        break; // Attempt succeeded, stop attempting
    }

    const wasAttemptSuccessful = !attemptError;
    if (!wasAttemptSuccessful) {
        throw attemptError;
    }
}

async function simulateHumanDelay() {
    await driver.sleep(550);
}

async function selectOption(selectSelector, optionSelector) {
    await simulateHumanDelay();
    await driver.findElement(selectSelector)
                .findElement(optionSelector)
                .click();
}
