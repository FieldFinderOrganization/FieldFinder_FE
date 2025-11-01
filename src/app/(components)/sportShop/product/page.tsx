"use client";

import React, { useState, useEffect, useMemo } from "react";
import FilterSection from "@/utils/filterSection";
import TopBar from "@/utils/topBar";
import InforBar from "@/utils/infoBar";
import { getAllCategory } from "@/services/category"; // 👈 Import ở đây

//  relocating interface here or in a shared types file
interface Category {
  id: number;
  name: string;
  description: string;
  parentName: string | null;
}

const Product = () => {
  const [selectedCategory, setSelectedCategory] = useState("Shoe (987)");
  const [subCategories, setSubCategories] = useState<string[]>([]);

  // --- State lifted up from TopBar ---
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [activeSport, setActiveSport] = React.useState<string | null>(null);

  // --- Data fetching lifted up from TopBar ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategory();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // --- Logic for grouping lifted up from TopBar ---
  const groupedCategories = React.useMemo(() => {
    const groups: Record<string, string[]> = {};
    const brands = ["Nike", "Adidas", "Puma", "Converse", "The North Face"];
    const sports = ["Running", "Football", "Tennis", "Basketball"];

    categories
      .filter(
        (c) =>
          c.name !== "test" &&
          !brands.includes(c.name) &&
          !sports.includes(c.parentName || "")
      )
      .forEach((c: any) => {
        if (c.parentName === null) {
          if (!groups[c.name]) groups[c.name] = [];
        } else {
          if (!groups[c.parentName]) groups[c.parentName] = [];
          groups[c.parentName].push(c.name);
        }
      });

    if (groups["Shoes"]) {
      groups["Shoes"] = [
        ...groups["Shoes"],
        "Running",
        "Football",
        "Tennis",
        "Basketball",
      ];
    }

    const ordered: Record<string, string[]> = {};
    if (groups["Featured"]) {
      ordered["Featured"] = groups["Featured"];
      delete groups["Featured"];
    }
    const order = ["Shoes", "Clothing", "Shop By Sport", "Accessories"];
    order.forEach((key) => {
      if (groups[key]) {
        ordered[key] = groups[key];
        delete groups[key];
      }
    });

    return { ...ordered, ...groups };
  }, [categories]);

  const groupedBrands = React.useMemo(() => {
    const brandNames = ["Nike", "Adidas", "Puma", "Converse", "The North Face"];
    const brands = categories.filter(
      (c) => brandNames.includes(c.name) && c.parentName === null
    );
    const defaultSubItems = [
      "Shoes",
      "Clothing",
      "Accessories",
      "Men",
      "Women",
    ];
    const groups: Record<string, string[]> = {
      Featured: categories
        .filter((c) => c.parentName === "Featured")
        .map((c) => c.name),
    };
    brands.forEach((b) => {
      groups[b.name] = defaultSubItems;
    });
    return groups;
  }, [categories]);

  // --- UNIFIED CLICK HANDLER ---
  // Logic is moved from TopBar's handleItemClick
  // This function now handles clicks from TopBar AND the sidebar
  const handleCategoryClick = (item: string) => {
    const uiGroupMap: Record<string, string[]> = {
      Shoes: [
        "All Shoes",
        "Lifestyle",
        "Running",
        "Football",
        "Tennis",
        "Basketball",
      ],
      "All Shoes": [
        "All Shoes",
        "Lifestyle",
        "Running",
        "Football",
        "Tennis",
        "Basketball",
      ],
      Clothing: [
        "All Clothing",
        "Tops And T-Shirts",
        "Shorts",
        "Pants And Leggings",
        "Hoodies And Sweatshirts",
        "Jackets And Gilets",
      ],
      "All Clothing": [
        "All Clothing",
        "Tops And T-Shirts",
        "Shorts",
        "Pants And Leggings",
        "Hoodies And Sweatshirts",
        "Jackets And Gilets",
      ],
      Accessories: [
        "Gloves",
        "Socks",
        "Hats And Headwears",
        "Bags And Backpacks",
      ],
    };

    const sports = ["Running", "Football", "Tennis", "Basketball"];
    let subItems: string[] = [];
    let sport = activeSport; // Get current sport state

    console.log("👉 Unified Click:", item);
    console.log("   Current activeSport:", sport);

    // 🟢 1. Nếu click vào sport
    if (sports.includes(item)) {
      sport = item;
      setActiveSport(item); // ⚡ Cập nhật state
      subItems = ["Shoes", "Clothing", "Accessories"];
      console.log("🏃 Sport clicked → showing:", subItems);
      setSelectedCategory(item); // ⚡ Cập nhật state
      setSubCategories(subItems); // ⚡ Cập nhật state
      return;
    }

    // 🟢 2. Nếu click vào "Shoes" khi đang ở sport
    if (item === "Shoes" && sport) {
      subItems = categories
        .filter((c) => c.parentName === sport)
        .map((c) => c.name);
      console.log(`👟 Clicked "Shoes" inside ${sport}:`, subItems);
      setSelectedCategory(`${sport} Shoes`); // ⚡ Cập nhật state
      setSubCategories(subItems); // ⚡ Cập nhật state
      return;
    }

    // 🟢 3. Nếu click vào "Clothing" khi đang ở sport
    if (item === "Clothing" && sport) {
      subItems = categories
        .filter((c) => c.parentName === sport)
        .map((c) => c.name);
      console.log(`👕 Clicked "Clothing" inside ${sport}:`, subItems);
      setSelectedCategory(`${sport} Clothing`); // ⚡ Cập nhật state
      setSubCategories(subItems); // ⚡ Cập nhật state
      return;
    }

    // 🟢 4. Nếu click vào "Accessories" khi đang ở sport
    if (item === "Accessories" && sport) {
      subItems = categories
        .filter((c) => c.parentName === sport)
        .map((c) => c.name);
      console.log(`🎒 Clicked "Accessories" inside ${sport}:`, subItems);
      setSelectedCategory(`${sport} Accessories`); // ⚡ Cập nhật state
      setSubCategories(subItems); // ⚡ Cập nhật state
      return;
    }

    // 🟢 5. Nếu click vào nhóm chính (ngoài sport)
    if (uiGroupMap[item]) {
      setActiveSport(null); // ⚡ Reset sport state
      subItems = uiGroupMap[item];
      console.log(`📂 Clicked group ${item}:`, subItems);
      setSelectedCategory(item); // ⚡ Cập nhật state
      setSubCategories(subItems); // ⚡ Cập nhật state
      return;
    }

    // 🟢 6. Nếu click vào con của nhóm chính
    for (const [key, values] of Object.entries(uiGroupMap)) {
      if (values.includes(item)) {
        setActiveSport(null); // ⚡ Reset sport state
        subItems = uiGroupMap[key];
        console.log(`📁 Clicked subitem ${item} of ${key}:`, subItems);
        setSelectedCategory(item); // ⚡ Cập nhật state
        setSubCategories(subItems); // ⚡ Cập nhật state
        return;
      }
    }

    // 🟢 7. Nếu chưa có subItems → lấy từ DB
    subItems = categories
      .filter((c) => c.parentName === item)
      .map((c) => c.name);

    console.log("📄 DB subItems:", subItems);
    setSelectedCategory(item); // ⚡ Cập nhật state
    setSubCategories(subItems.length > 0 ? subItems : [item]); // ⚡ Cập nhật state
  };

  const filters = [
    { title: "Gender (1)", options: ["Men", "Women"] },
    {
      title: "Shop By Price",
      options: [
        "Under 1.000.000₫",
        "1.000.000₫ - 3.000.000₫",
        "Over 3.000.000₫",
      ],
    },
    {
      title: "Sale & Offers",
      options: ["On Sale", "Best Seller", "New Arrival"],
    },
    { title: "Size", options: ["38", "39", "40", "41", "42", "43"] },
    {
      title: "Brand",
      options: ["Nike", "Adidas", "Puma", "Converse", "The North Face"],
    },
  ];

  return (
    <div>
      {/* Truyền data và handler XUỐNG cho TopBar */}
      <TopBar
        groupedCategories={groupedCategories}
        groupedBrands={groupedBrands}
        onCategoryClick={handleCategoryClick}
      />

      <InforBar />
      <div className="flex-col">
        <div className="flex items-center pt-[2rem] px-[5rem] justify-between">
          <h2 className="text-3xl font-semibold mb-4">{selectedCategory}</h2>
          <h2 className="text-xl font-bold mb-4">{selectedCategory}</h2>
        </div>

        <div className="flex">
          <div className="w-[25%] pb-[2rem] pl-[5rem] pr-[3rem] h-[calc(80vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {subCategories.length > 0 && (
              <div className="flex flex-col gap-6 mb-4">
                {subCategories.map((item) => (
                  <span
                    key={item}
                    className="text-gray-700 cursor-pointer hover:text-blue-600 transition"
                    // 🚨 THÊM HANDLER VÀO ĐÂY 🚨
                    onClick={() => handleCategoryClick(item)}
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            {filters.map((f, i) => (
              <FilterSection key={i} title={f.title} options={f.options} />
            ))}
          </div>

          <div className="w-[70%] p-6"></div>
        </div>
      </div>
    </div>
  );
};

export default Product;
