/* eslint-disable @typescript-eslint/no-unused-vars */
import "chromedriver";
import { Builder, By, Key, until } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome.js";

const TIMEOUT = 15000;

const generateTestData = () => {
  const timestamp = Date.now();
  return {
    name: `Auto Test User ${timestamp}`,
    email: `auto_user_${timestamp}@gmail.com`,
    phone: `09${Math.floor(Math.random() * 100000000)}`,
    password: "Password@123",
  };
};

(async function testSignupFlow() {
  console.log("🚀 STARTING E2E TEST: SIGNUP -> LOGIN -> OTP...");

  let options = new Options();
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  const TEST_USER = generateTestData();
  console.log("📝 Test Data Created:", TEST_USER);

  try {
    await driver.manage().window().maximize();
    await driver.get("http://localhost:3000/signup");
    console.log("1️⃣  Opened Signup Page");

    let nameInput = await driver.wait(
      until.elementLocated(
        By.xpath("//input[@placeholder='Điền tên của bạn']")
      ),
      TIMEOUT
    );
    await nameInput.sendKeys(TEST_USER.name);

    let emailInput = await driver.findElement(
      By.xpath("//input[@placeholder='Điền email của bạn']")
    );
    await emailInput.sendKeys(TEST_USER.email);

    let phoneInput = await driver.findElement(
      By.xpath("//input[@placeholder='Điền số điện thoại']")
    );
    await phoneInput.sendKeys(TEST_USER.phone);

    let passInput = await driver.findElement(
      By.xpath("//input[@placeholder='Điền mật khẩu']")
    );
    await passInput.sendKeys(TEST_USER.password);

    let signupBtn = await driver.findElement(
      By.xpath("//button[text()='Đăng ký']")
    );
    await signupBtn.click();
    console.log("   -> Clicked Signup button");

    try {
      await driver.wait(until.urlContains("/login"), 10000); // Chờ 10s
      console.log("2️⃣  Redirected to Login Page Successfully");
    } catch (e) {
      console.log("⚠️  Redirect failed. Checking for error messages on UI...");

      try {
        let toastError = await driver.findElement(
          By.css(".Toastify__toast-body")
        );
        let errorText = await toastError.getText();
        console.error("❌ SIGNUP FAILED. UI Message: " + errorText);
      } catch (toastErr) {
        console.error("❌ SIGNUP FAILED but could not find Toast message.");

        let currentUrl = await driver.getCurrentUrl();
        console.log("   Current URL is: " + currentUrl);
      }

      throw new Error("Test Failed at Signup Step");
    }

    let loginEmail = await driver.wait(
      until.elementLocated(By.name("email")),
      TIMEOUT
    );
    await loginEmail.sendKeys(TEST_USER.email);

    let loginPass = await driver.findElement(By.name("password"));
    await loginPass.sendKeys(TEST_USER.password);

    console.log("   -> Filled Login form with new credentials");

    let loginBtn = await driver.findElement(
      By.xpath("//button[text()='Đăng nhập']")
    );
    await loginBtn.click();

    let otpToast = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(), 'OTP đã được gửi')]")
      ),
      TIMEOUT
    );
  } catch (error) {
    console.error("❌ TEST FAILED:", error);
  } finally {
    console.log("🏁 Test finished.");
  }
})();
