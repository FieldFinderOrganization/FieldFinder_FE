"use client";
import * as React from "react";
import { motion } from "framer-motion";
import { LineChart } from "@mui/x-charts/LineChart";
import Header from "@/utils/header";
import { FaUsers, FaLightbulb, FaChartLine, FaHandshake } from "react-icons/fa";
import { IoIosRocket } from "react-icons/io";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />

      <div className="main flex flex-col items-center justify-center max-w-7xl w-full px-4 mt-[1rem] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Về Chúng Tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Khám phá câu chuyện, sứ mệnh và đội ngũ đứng sau nền tảng đặt sân
            thể thao hàng đầu
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 h-full">
              <div className="flex items-center mb-6">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <IoIosRocket className="text-3xl text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold">Sứ Mệnh Của Chúng Tôi</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Chúng tôi cam kết mang đến trải nghiệm đặt sân thể thao dễ dàng,
                nhanh chóng và minh bạch cho mọi người yêu thể thao. Với công
                nghệ tiên tiến, chúng tôi kết nối người chơi với những sân thể
                thao chất lượng nhất.
              </p>
              <p className="text-gray-600">
                Sứ mệnh của chúng tôi là xây dựng cộng đồng thể thao phát triển
                bền vững, nơi mọi người có thể dễ dàng tiếp cận với các hoạt
                động thể chất và giao lưu kết nối.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white h-full">
              <div className="flex items-center mb-6">
                <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                  <FaChartLine className="text-3xl" />
                </div>
                <h2 className="text-2xl font-bold">Tầm Nhìn</h2>
              </div>
              <p className="mb-4">
                Trở thành nền tảng đặt sân thể thao số 1 tại Việt Nam, phục vụ
                hơn 1 triệu người dùng với hơn 5.000 sân thể thao liên kết vào
                năm 2026.
              </p>
              <p>
                Chúng tôi hướng tới việc ứng dụng trí tuệ nhân tạo để tối ưu hóa
                trải nghiệm người dùng và dự báo nhu cầu sử dụng sân thể thao
                trên toàn quốc.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold text-center mb-16">
            Giá Trị Cốt Lõi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaHandshake className="text-4xl" />,
                title: "Minh Bạch",
                desc: "Công khai thông tin giá cả, đánh giá và lịch sử đặt sân",
              },
              {
                icon: <FaUsers className="text-4xl" />,
                title: "Cộng Đồng",
                desc: "Xây dựng mạng lưới người chơi thể thao gắn kết",
              },
              {
                icon: <FaLightbulb className="text-4xl" />,
                title: "Sáng Tạo",
                desc: "Liên tục đổi mới để mang đến giải pháp tối ưu",
              },
              {
                icon: <FaChartLine className="text-4xl" />,
                title: "Phát Triển",
                desc: "Đồng hành cùng sự phát triển của thể thao Việt Nam",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{
                  y: -10,
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                }}
                className="bg-white p-8 rounded-2xl shadow-lg text-center"
              >
                <div className="text-blue-600 mb-4 flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 md:p-12 mb-24 w-full">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white"
          >
            {[
              { value: "10,000+", label: "Lượt Đặt Sân" },
              { value: "500+", label: "Sân Thể Thao" },
              { value: "50+", label: "Thành Phố" },
              { value: "99%", label: "Hài Lòng" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base opacity-90">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full bg-white p-8 rounded-2xl shadow-xl mb-24"
        >
          <h2 className="text-3xl font-bold text-center mb-10">
            Hành Trình Phát Triển
          </h2>
          <div className="h-80">
            <LineChart
              xAxis={[{ data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }]}
              series={[
                {
                  data: [
                    100, 500, 2000, 3500, 6000, 8000, 9500, 11000, 13000, 15000,
                  ],
                  area: true,
                  color: "#6366f1",
                },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 text-center">
            {[
              { year: "2021", event: "Thành lập công ty" },
              { year: "2022", event: "Ra mắt phiên bản đầu tiên" },
              { year: "2023", event: "Mở rộng 20 tỉnh thành" },
              { year: "2024", event: "Đạt 10.000 lượt đặt sân/tháng" },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full -top-2"></div>
                <div className="pt-4 border-t-2 border-blue-200">
                  <div className="font-bold text-blue-600">{item.year}</div>
                  <div className="text-gray-600 mt-2">{item.event}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Sẵn Sàng Trải Nghiệm?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Tham gia cùng hơn 50.000 người đang sử dụng nền tảng của chúng tôi
            để đặt sân thể thao mỗi ngày
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg"
          >
            Bắt Đầu Ngay
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
