import { By, Key } from 'selenium-webdriver';
import { driver, test, markers } from 'thousandeyes';

runScript();

async function runScript() {

  await configureDriver();

  const settings = test.getSettings();

  // Load page
  markers.start('Load');
  await driver.get(settings.url);
  await driver.takeScreenshot();
  markers.stop('Load');


  // Click on 'Black Tea Pure black tea and blends'
  markers.start('Browse Items');
  await click(By.id(`link_Black Tea`));

  // Click on 'Add to Cart'
  await click(By.css(`.col-sm-6:nth-child(1) [name="addToCart"]`));

  // Click on 'Rooibos In many variations'
  await click(By.id(`link_Rooibos`));

  // Click on 'Add to Cart'
  await click(By.css(`.col-sm-6:nth-child(5) [name="addToCart"]`));

  // Click on 'White Tea If green tea doesn't agre...'
  await click(By.id(`link_White Tea`));

  // Click on 'Add to Cart'
  await click(By.css(`.col-sm-6:nth-child(9) [name="addToCart"]`));
  markers.stop('Browse Items');

  // Click on '1'
  markers.start('Update Cart');
  await click(By.name(`orderitem_415`));

  await typeText('6', By.name(`orderitem_415`));

  // Click on 'Update Cart'
  await click(By.name(`updateCartQuantities`));
  markers.stop('Update Cart');
  await driver.takeScreenshot();

  // Click on 'Proceed to Checkout'
  await click(By.name(`proceedtoCheckout`));

  markers.start('SignIn');
  // Click on 'Sign in'
  await click(By.name(`signin`));
  await driver.takeScreenshot();
  markers.stop('SignIn');

  markers.start('Checkout & Order');
  // Click on 'Proceed to Checkout'
  await click(By.name(`proceedtoCheckout`));
  await driver.takeScreenshot();

  // Click on 'Confirm'
  await click(By.name(`confirm`));
  markers.stop('Checkout & Order');
  await driver.takeScreenshot();

}

async function configureDriver() {
  await driver.manage().setTimeouts({
    implicit: 7 * 1000 // If an element is not found, reattempt for this many milliseconds
  });
}

async function click(selector) {
  await simulateHumanDelay();

  const configuredTimeouts = await driver.manage().getTimeouts();
  const clickAttemptEndTime = Date.now() + configuredTimeouts.implicit;

  await reattemptUntil(attemptToClick, clickAttemptEndTime);

  async function attemptToClick() {
    await driver.findElement(selector).
    click();
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

async function typeText(value, selector) {
  await simulateHumanDelay();
  const element = await driver.findElement(selector);
  await element.clear();
  await element.sendKeys(value);
}