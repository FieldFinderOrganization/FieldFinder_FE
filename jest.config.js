/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Đường dẫn tới thư mục gốc của Next.js
  dir: "./",
});

// Cấu hình tùy chỉnh cho Jest
const customJestConfig = {
  // Trỏ tới file setup (chúng ta sẽ tạo ở Bước 2)
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Môi trường giả lập trình duyệt
  testEnvironment: "jest-environment-jsdom",
};

// createJestConfig sẽ giúp load next.config.js và các biến môi trường
module.exports = createJestConfig(customJestConfig);
