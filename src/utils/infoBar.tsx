import React from "react";

const InforBar = () => {
  const items = [
    {
      icon: "🏆",
      title: "High Quality",
      desc: "Crafted from top materials",
    },
    {
      icon: "⏱️",
      title: "Warranty Protection",
      desc: "Over 2 years",
    },
    {
      icon: "🛒",
      title: "Free Shipping",
      desc: "Order over 150 $",
    },
    {
      icon: "🎧",
      title: "24 / 7 Support",
      desc: "Dedicated support",
    },
  ];

  return (
    <div className="w-full  py-5 z-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-left gap-6 px-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-start space-x-3 border-r border-gray-300 last:border-none"
          >
            <div className="text-3xl text-gray-700">{item.icon}</div>

            <div>
              <h4 className="text-sm font-semibold text-gray-800">
                {item.title}
              </h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InforBar;
