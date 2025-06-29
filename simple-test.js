const { chromium } = require("playwright");

async function test() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
        await page.goto("http://localhost:3000", { timeout: 5000 });
        await page.waitForTimeout(2000);
        
        const title = await page.title();
        const buttons = await page.locator("button").count();
        const menuElements = await page.locator("[data-testid*=menu], [class*=menu]").count();
        const projectElements = await page.locator("[data-testid*=project], [class*=project]").count();
        
        console.log(`TITLE: ${title}`);
        console.log(`BUTTONS: ${buttons}`);
        console.log(`MENU_ELEMENTS: ${menuElements}`);
        console.log(`PROJECT_ELEMENTS: ${projectElements}`);
        
        if (buttons > 0) {
            console.log("CLICKING_FIRST_BUTTON");
            await page.locator("button").first().click();
            console.log("BUTTON_CLICKED_SUCCESS");
        }
        
        await page.screenshot({ path: "/tmp/ui-test.png" });
        console.log("SCREENSHOT_SAVED");
        
    } catch (e) {
        console.log(`ERROR: ${e.message}`);
    } finally {
        await browser.close();
    }
}

test();
