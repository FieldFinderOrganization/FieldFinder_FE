"use client";
import React, { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

interface FilterSectionProps {
  title: string;
  options: string[];
  selectedOptions: string[]; // 👈 THÊM: Nhận state từ Cha
  onToggleOption: (option: string) => void; // 👈 THÊM: Nhận hàm xử lý từ Cha
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  options,
  selectedOptions, // 👈 THÊM
  onToggleOption, // 👈 THÊM
}) => {
  const [open, setOpen] = useState(false);
  // ⛔ XOÁ: const [selected, setSelected] = useState<string[]>([]);
  // ⛔ XOÁ: const toggleOption = ...

  return (
    <div className="border-b border-gray-300 py-3">
      {/* Header */}
      <div
        className="flex justify-between items-center cursor-pointer select-none"
        onClick={() => setOpen(!open)}
      >
        <h4 className="font-medium text-gray-800">{title}</h4>
        {open ? <IoIosArrowUp size={18} /> : <IoIosArrowDown size={18} />}
      </div>

      {/* Options */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-60 mt-2 overflow-y-auto" : "max-h-0" // Tăng max-h, thêm overflow-y
        }`}
      >
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 py-1 text-gray-700 cursor-pointer hover:text-blue-600"
          >
            <input
              type="checkbox"
              // 👈 SỬA: Dùng state và hàm từ props
              checked={selectedOptions.includes(option)}
              onChange={() => onToggleOption(option)}
              className="cursor-pointer accent-blue-600"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
};

export default FilterSection;
