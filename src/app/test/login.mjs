/* eslint-disable @typescript-eslint/no-unused-vars */
import "chromedriver";
import { Builder, By, Key, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";

const BASE_URL = "http://localhost:3000/login";
const TIMEOUT = 15000;

const VALID_USER = {
  email: "triet17@gmail.com",
  password: "Password@123",
};

const findEl = async (driver, xpath) => {
  return await driver.wait(until.elementLocated(By.xpath(xpath)), TIMEOUT);
};

const checkToastMessage = async (driver, message, testName) => {
  try {
    const toast = await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), '${message}')]`)),
      5000
    );
    console.log(`   ✅ PASS [${testName}]: Thấy thông báo "${message}"`);
  } catch (e) {
    console.log(`   ❌ FAIL [${testName}]: Không thấy thông báo "${message}"`);
    throw e;
  }
};

(async function runLoginTests() {
  console.log("🚀 STARTING AUTOMATION TESTS FOR LOGIN...");

  let options = new Options();
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    await driver.manage().window().maximize();

    console.log("\n🧪 [1/3] TEST VALIDATION (Empty & Format)...");
    await driver.get(BASE_URL);

    const emailInput = await findEl(driver, "//input[@name='email']");
    const passInput = await findEl(driver, "//input[@name='password']");
    const loginBtn = await findEl(driver, "//button[text()='Đăng nhập']");

    await loginBtn.click();

    await checkToastMessage(
      driver,
      "Vui lòng nhập đủ Email và Mật khẩu!",
      "Empty Submit"
    );

    await emailInput.sendKeys("invalid-email-format");
    await passInput.sendKeys("123456");

    try {
      await driver.wait(
        until.elementLocated(
          By.xpath("//p[text()='Định dạng email không hợp lệ.']")
        ),
        2000
      );
      console.log("   ✅ PASS [Format Email]: Hiển thị lỗi định dạng email.");
    } catch (e) {
      console.log("   ❌ FAIL [Format Email]: Không hiển thị lỗi inline.");
    }

    console.log("\n🧪 [2/3] TEST INVALID LOGIN (Wrong Creds)...");
    await driver.navigate().refresh();

    const wrongEmail = `wrong_${Date.now()}@gmail.com`;

    await (await findEl(driver, "//input[@name='email']")).sendKeys(wrongEmail);
    await (
      await findEl(driver, "//input[@name='password']")
    ).sendKeys("AnyPassword");
    await (await findEl(driver, "//button[text()='Đăng nhập']")).click();

    await checkToastMessage(
      driver,
      "Sai email hoặc mật khẩu!",
      "Invalid Creds"
    );

    console.log(
      `\n🧪 [3/3] TEST HAPPY PATH (Login -> OTP Modal) with ${VALID_USER.email}...`
    );
    await driver.navigate().refresh();

    await (
      await findEl(driver, "//input[@name='email']")
    ).sendKeys(VALID_USER.email);
    await (
      await findEl(driver, "//input[@name='password']")
    ).sendKeys(VALID_USER.password);

    const validLoginBtn = await findEl(driver, "//button[text()='Đăng nhập']");
    await validLoginBtn.click();

    try {
      await checkToastMessage(driver, "OTP đã được gửi", "OTP Sent Toast");
    } catch (e) {
      console.log(
        "   ⚠️ Warning: Không bắt được Toast OTP (có thể do mạng chậm), kiểm tra Modal tiếp theo..."
      );
    }

    try {
      await driver.wait(
        until.elementLocated(
          By.xpath("//*[contains(text(), 'OTP') or contains(@class, 'modal')]")
        ),
        10000
      );
      console.log("   ✅ PASS [Happy Path]: OTP Modal đã xuất hiện.");
    } catch (e) {
      console.log(
        "   ❌ FAIL [Happy Path]: Không thấy OTP Modal hiện ra sau khi đăng nhập đúng."
      );
    }
  } catch (error) {
    console.error("❌ GLOBAL ERROR:", error);
  } finally {
    console.log("\n🏁 Closing browser...");
    await driver.quit();
  }
})();
