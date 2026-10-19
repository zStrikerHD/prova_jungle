const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
  const imgPath = 'file:///C:/Users/giova/.gemini/antigravity-ide/brain/5d9a6469-45f0-4a0c-b458-7ab7d950abd7/.tempmediaStorage/media_1792276555341.webp';
  await page.goto(imgPath);
  await page.waitForTimeout(500);
  
  // Crop the catalog of the first artboard
  // The full image is 960x960 approx. First artboard is on the top-left.
  await page.screenshot({
    path: 'figma_catalog_crop.png',
    clip: { x: 10, y: 80, width: 170, height: 260 }
  });
  
  await browser.close();
  console.log('crop saved');
})();
