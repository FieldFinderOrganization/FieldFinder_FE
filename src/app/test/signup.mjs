/* eslint-disable @typescript-eslint/no-unused-vars */
import { Builder, By, Key, until } from "selenium-webdriver";
import "chromedriver";
import { Options } from "selenium-webdriver/chrome.js";

const BASE_URL = "http://localhost:3000/signup";
const TIMEOUT = 10000;

const generateTestData = () => {
  const timestamp = Date.now();
  return {
    name: `User Auto ${timestamp}`,
    email: `auto_test_${timestamp}@gmail.com`,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    password: "Password@123",
  };
};

(async function runSignupTests() {
  console.log("🚀 STARTING AUTOMATION TESTS FOR SIGNUP...");

  let options = new Options();
  options.addArguments("--no-sandbox");
  options.addArguments("--disable-dev-shm-usage");

  let driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  const VALID_USER = generateTestData();

  try {
    await driver.manage().window().maximize();

    await driver.get(BASE_URL);

    const submitBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[text()='Đăng ký']")),
      TIMEOUT
    );
    await submitBtn.click();

    try {
      await driver.wait(
        until.elementLocated(
          By.xpath("//p[text()='Vui lòng nhập tên của bạn.']")
        ),
        3000
      );
      await driver.wait(
        until.elementLocated(By.xpath("//p[text()='Vui lòng nhập email.']")),
        3000
      );
      console.log("   ✅ PASS: Hệ thống báo lỗi khi bỏ trống form.");
    } catch (e) {
      console.log("   ❌ FAIL: Không thấy thông báo lỗi validation.");
    }

    console.log(
      `\n🧪 [2/3] TEST 004 - Đăng ký thành công với: ${VALID_USER.email}`
    );
    await driver.get(BASE_URL);

    await driver
      .findElement(By.xpath("//input[@placeholder='Điền tên của bạn']"))
      .sendKeys(VALID_USER.name);

    await driver
      .findElement(By.xpath("//input[@placeholder='Điền email của bạn']"))
      .sendKeys(VALID_USER.email);

    await driver
      .findElement(By.xpath("//input[@placeholder='Điền số điện thoại']"))
      .sendKeys(VALID_USER.phone);

    await driver
      .findElement(By.xpath("//input[@placeholder='Điền mật khẩu']"))
      .sendKeys(VALID_USER.password);

    const roleSelect = await driver.findElement(By.id("demo-simple-select"));
    await roleSelect.click();

    const userOption = await driver.wait(
      until.elementLocated(By.css("li[data-value='USER']")),
      3000
    );
    await userOption.click();

    const btnSignup = await driver.findElement(
      By.xpath("//button[text()='Đăng ký']")
    );
    await btnSignup.click();

    try {
      await driver.wait(until.urlContains("/login"), 5000);
      console.log(
        "   ✅ PASS: Đăng ký thành công, đã chuyển hướng sang Login."
      );
    } catch (err) {
      // Cách 2: Nếu không chuyển trang kịp, check Toast success
      try {
        await driver.wait(
          until.elementLocated(By.css(".Toastify__toast--success")),
          3000
        );
        console.log("   ✅ PASS: Thấy thông báo đăng ký thành công.");
      } catch (e) {
        console.error(
          "   ❌ FAIL: Không chuyển trang và không thấy thông báo thành công."
        );
        throw e;
      }
    }
    console.log(`\n🧪 [3/3] TEST 001 - Check trùng Email: ${VALID_USER.email}`);
    await driver.get(BASE_URL);

    await driver
      .findElement(By.xpath("//input[@placeholder='Điền tên của bạn']"))
      .sendKeys(VALID_USER.name);
    await driver
      .findElement(By.xpath("//input[@placeholder='Điền email của bạn']"))
      .sendKeys(VALID_USER.email);
    await driver
      .findElement(By.xpath("//input[@placeholder='Điền số điện thoại']"))
      .sendKeys("0987654322");
    await driver
      .findElement(By.xpath("//input[@placeholder='Điền mật khẩu']"))
      .sendKeys("Password123");

    const btnRetry = await driver.findElement(
      By.xpath("//button[text()='Đăng ký']")
    );
    await btnRetry.click();

    try {
      const toastError = await driver.wait(
        until.elementLocated(By.css(".Toastify__toast--error")),
        5000
      );
      const msg = await toastError.getText();
      console.log(
        `   ✅ PASS: Hệ thống chặn trùng email thành công. Thông báo: "${msg}"`
      );
    } catch (e) {
      console.error(
        "   ❌ FAIL: Hệ thống không báo lỗi khi trùng email (Hoặc Toast không hiện)."
      );
    }
  } catch (error) {
    console.error("❌ CÓ LỖI XẢY RA:", error);
  } finally {
    console.log("\n🏁 Đang đóng trình duyệt...");
    await driver.quit();
  }
})();
