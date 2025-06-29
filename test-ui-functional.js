const { chromium } = require("playwright");

async function testUIFunctional() {
    console.log("🎯 STARTING ACTUAL UI FUNCTIONAL TESTING");
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // Navigate to UI
        console.log("📡 Navigating to http://localhost:3000");
        await page.goto("http://localhost:3000", { waitUntil: "load", timeout: 10000 });
        
        // Wait for page to fully load
        await page.waitForTimeout(3000);
        
        // Get page title
        const title = await page.title();
        console.log();
        
        // Test if page loaded
        const bodyContent = await page.textContent("body");
        if (bodyContent.length > 100) {
            console.log("✅ UI loaded with content");
        } else {
            console.log("❌ UI loaded but minimal content");
        }
        
        // Look for any buttons
        const buttons = await page.locator("button").count();
        console.log();
        
        // Look for menu-related elements
        const menuElements = await page.locator("[data-testid*=menu], [class*=menu], [id*=menu]").count();
        console.log();
        
        // Look for project-related elements  
        const projectElements = await page.locator("[data-testid*=project], [class*=project], [id*=project]").count();
        console.log();
        
        // Look for track-related elements
        const trackElements = await page.locator("[data-testid*=track], [class*=track], [id*=track]").count();
        console.log();
        
        // Look for clip-related elements
        const clipElements = await page.locator("[data-testid*=clip], [class*=clip], [id*=clip]").count();
        console.log();
        
        // Test clicking any buttons found
        if (buttons > 0) {
            console.log("🖱️ Testing button clicks...");
            const allButtons = await page.locator("button").all();
            for (let i = 0; i < Math.min(5, allButtons.length); i++) {
                try {
                    const buttonText = await allButtons[i].textContent();
                    console.log();
                    await allButtons[i].click();
                    await page.waitForTimeout(500);
                    console.log();
                } catch (e) {
                    console.log();
                }
            }
        }
        
        // Screenshot for evidence
        await page.screenshot({ path: "/tmp/ui-functional-test.png" });
        console.log("📸 Screenshot saved to /tmp/ui-functional-test.png");
        
        // Final assessment
        const totalInteractiveElements = buttons + menuElements + projectElements + trackElements + clipElements;
        console.log();
        
        if (totalInteractiveElements === 0) {
            console.log("❌ UI FUNCTIONAL COMPLIANCE: FAILED - NO INTERACTIVE ELEMENTS");
            process.exit(1);
        } else if (totalInteractiveElements < 10) {
            console.log("⚠️ UI FUNCTIONAL COMPLIANCE: MINIMAL - FEW INTERACTIVE ELEMENTS");
            process.exit(2);
        } else {
            console.log("✅ UI FUNCTIONAL COMPLIANCE: BASIC - INTERACTIVE ELEMENTS FOUND");
            process.exit(0);
        }
        
    } catch (error) {
        console.log();
        process.exit(1);
    } finally {
        await browser.close();
    }
}

testUIFunctional();
