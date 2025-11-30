import "chromedriver";
import { Builder, By, Key, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";

(async function testLoginComponent() {
  console.log("1. Start...");

  let options = new Options();
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  let driver;

  try {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    await driver.manage().window().maximize();
    await driver.get("http://localhost:3000/login");

    let emailInput = await driver.wait(
      until.elementLocated(By.name("email")),
      10000
    );

    let passwordInput = await driver.findElement(By.name("password"));

    await emailInput.sendKeys("testuser@gmail.com");

    // THAY ĐỔI Ở ĐÂY: Thêm Key.RETURN để nhấn Enter ngay sau khi nhập pass
    await passwordInput.sendKeys("123456", Key.RETURN);

    // Không cần tìm nút và click nữa

    let toastMessage = await driver.wait(
      until.elementLocated(By.css(".Toastify__toast-body, .Toastify__toast")),
      10000
    );

    let text = await toastMessage.getText();
    console.log("RESULT: " + text);
  } catch (error) {
    console.error("FAILED:", error);
  } finally {
    if (driver) {
      console.log("Done.");
    }
  }
})();
