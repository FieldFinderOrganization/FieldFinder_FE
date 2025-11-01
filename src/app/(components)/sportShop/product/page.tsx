"use client";

import React, { useState, useEffect, useMemo } from "react";
import FilterSection from "@/utils/filterSection";
import TopBar from "@/utils/topBar";
import InforBar from "@/utils/infoBar";
import { getAllCategory } from "@/services/category";
import { IoOptionsOutline } from "react-icons/io5";
import { getAllProducts, productRes } from "@/services/product"; // Import service sản phẩm

// 1. IMPORT COMPONENT CON
import ProductCard from "@/utils/productCard"; // Giả sử bạn đặt ở đây

// --- INTERFACES ---

interface Category {
  id: number;
  name: string;
  description: string;
  parentName: string | null;
}

interface AppState {
  selectedCategory: string;
  subCategories: string[];
  activeSport: string | null;
}

interface HistoryItem {
  title: string;
  state: AppState;
  isLeaf: boolean;
}

const INITIAL_STATE: AppState = {
  selectedCategory: "All Products",
  subCategories: [
    "Featured",
    "Shoes",
    "Clothing",
    "Shop By Sport",
    "Accessories",
  ],
  activeSport: null,
};

// --- COMPONENT CHÍNH (Product) ---

const Product = () => {
  // State cho Breadcrumb/Filter
  const [history, setHistory] = useState<HistoryItem[]>([
    { title: "All Products", state: INITIAL_STATE, isLeaf: false },
  ]);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const currentState = history[history.length - 1].state;
  const { selectedCategory, subCategories, activeSport } = currentState;

  // State cho Data
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<productRes[]>([]);

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({
    Gender: ["Men"],
    "Shop By Price": [],
    "Sale & Offers": [],
    Size: [],
    Brand: [],
  });

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setAllProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const groupedCategories = React.useMemo(() => {
    const groups: Record<string, string[]> = {};
    const brands = ["Nike", "Adidas", "Puma", "Converse", "K-Swiss"];
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

  // Memo cho TopBar
  const groupedBrands = React.useMemo(() => {
    const brandNames = ["Nike", "Adidas", "Puma", "Converse", "K-Swiss"];
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

  // Memo để tạo map tra cứu (Con -> Cha) cho logic lọc
  const categoryParentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    categories.forEach((cat) => {
      map.set(cat.name, cat.parentName);
    });
    // Thêm các gốc
    map.set("Shoes", "All Products");
    map.set("Clothing", "All Products");
    map.set("Accessories", "All Products");
    map.set("Shop By Sport", "All Products");
    map.set("Featured", "All Products");
    return map;
  }, [categories]);

  // Memo để lọc sản phẩm
  const filteredProducts = useMemo(() => {
    // 1. Lọc theo Category (logic cũ của bạn)
    let categoryFiltered = [];
    if (selectedCategory === "All Products") {
      categoryFiltered = allProducts;
    } else {
      categoryFiltered = allProducts.filter((product) => {
        let currentCatName: string | null | undefined = product.categoryName;
        while (currentCatName) {
          if (currentCatName === selectedCategory) {
            return true;
          }
          currentCatName = categoryParentMap.get(currentCatName);
        }
        return false;
      });
    }

    // 2. Kiểm tra xem có filter nào đang được chọn không
    const isFilterActive = Object.values(selectedFilters).some(
      (arr) => arr.length > 0
    );

    if (!isFilterActive) {
      return categoryFiltered; // Nếu không, trả về ds đã lọc theo category
    }

    // 3. Lọc tiếp theo các filter (Gender, Brand, Price, v.v.)
    return categoryFiltered.filter((product) => {
      // Logic AND (phải khớp MỌI group filter)
      // e.g., (Gender = 'Men') AND (Brand = 'Nike')

      for (const [filterKey, selectedOptions] of Object.entries(
        selectedFilters
      )) {
        if (selectedOptions.length === 0) {
          continue; // Bỏ qua group này nếu không có gì được chọn
        }

        // --- Logic cho từng loại filter ---

        if (filterKey === "Gender") {
          const productSex = product.sex; // 1. Tạo một Set (bộ) các lựa chọn của người dùng

          const targetGenders = new Set(selectedOptions); // 2. Áp dụng luật mới: Nếu chọn cả Men VÀ Women, tự động thêm "Unisex"

          if (targetGenders.has("Men") && targetGenders.has("Women")) {
            targetGenders.add("Unisex");
          } // 3. Kiểm tra xem product.sex có nằm trong bộ target không

          if (!targetGenders.has(productSex)) {
            return false; // Không khớp, loại
          }
        } else if (filterKey === "Brand") {
          if (!selectedOptions.includes(product.brand)) {
            return false; // Không khớp, loại
          }
        } else if (filterKey === "Shop By Price") {
          const passes = selectedOptions.some((option) => {
            if (option === "Under 1.000.000₫") return product.price < 1000000;
            if (option === "1.000.000₫ - 3.000.000₫")
              return product.price >= 1000000 && product.price <= 3000000;
            if (option === "Over 3.000.000₫") return product.price > 3000000;
            return false;
          });
          if (!passes) return false; // Không khớp, loại
        }

        // --- Cảnh báo: Logic cho "Size" và "Sale & Offers" ---
        // (productRes của bạn không có data cho Size và Sale.
        // Mình sẽ tạm bỏ qua, bạn cần thêm data vào productRes để lọc 2 mục này)
        else if (filterKey === "Sale & Offers") {
          // BỎ QUA VÌ KHÔNG CÓ DATA
        } else if (filterKey === "Size") {
          // BỎ QUA VÌ KHÔNG CÓ DATA
        }
      }

      // Nếu sản phẩm vượt qua tất cả các bộ lọc
      return true;
    });
  }, [
    allProducts,
    selectedCategory,
    categoryParentMap,
    selectedFilters, // 👈 THÊM dependency
  ]);

  // --- 3. LOGIC XỬ LÝ NAVIGATE/BREADCRUMB ---

  const getNextState = (
    item: string,
    currentActiveSport: string | null,
    currentSubCategories: string[]
  ): AppState => {
    const uiGroupMap: Record<string, string[]> = {
      Shoes: ["All Shoes", "Lifestyle", "Athletic Shoes", "Dress Shoes"],
      "All Shoes": ["All Shoes", "Lifestyle", "Athletic Shoes", "Dress Shoes"],
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
      Featured: categories
        .filter((c) => c.parentName === "Featured")
        .map((c) => c.name),
      "Shop By Sport": categories
        .filter((c) => c.parentName === "Shop By Sport")
        .map((c) => c.name),
    };
    const sports = ["Running", "Football", "Tennis", "Basketball"];
    let subItems: string[] = [];
    let sport = currentActiveSport;

    // 1. Click vào sport
    if (sports.includes(item)) {
      return {
        selectedCategory: item,
        subCategories: ["Shoes", "Clothing", "Accessories"],
        activeSport: item,
      };
    }
    // 2. Click vào "Shoes" khi đang ở sport
    if (item === "Shoes" && sport) {
      subItems = categories
        .filter((c) => c.parentName === sport)
        .map((c) => c.name);
      return {
        selectedCategory: `${sport} Shoes`,
        subCategories: subItems,
        activeSport: sport,
      };
    }
    // 3. Click vào "Clothing" khi đang ở sport
    if (item === "Clothing" && sport) {
      subItems = categories
        .filter((c) => c.parentName === sport)
        .map((c) => c.name);
      return {
        selectedCategory: `${sport} Clothing`,
        subCategories: subItems,
        activeSport: sport,
      };
    }
    // 4. Click vào "Accessories" khi đang ở sport
    if (item === "Accessories" && sport) {
      subItems = categories
        .filter((c) => c.parentName === sport)
        .map((c) => c.name);
      return {
        selectedCategory: `${sport} Accessories`,
        subCategories: subItems,
        activeSport: sport,
      };
    }
    // 5. Click vào nhóm chính (ngoài sport) -> SẼ RESET SPORT
    if (uiGroupMap[item]) {
      return {
        selectedCategory: item,
        subCategories: uiGroupMap[item],
        activeSport: null,
      };
    }
    // 6. Click vào con của nhóm chính -> SẼ RESET SPORT
    for (const [key, values] of Object.entries(uiGroupMap)) {
      if (values.includes(item)) {
        return {
          selectedCategory: item,
          subCategories: uiGroupMap[key],
          activeSport: null,
        };
      }
    }
    // 7. Fallback: Lấy từ DB (con của sport, v.v.)
    subItems = categories
      .filter((c) => c.parentName === item)
      .map((c) => c.name);
    const isLeaf = subItems.length === 0;
    return {
      selectedCategory: item,
      subCategories: isLeaf ? currentSubCategories : subItems,
      activeSport: sport,
    };
  };

  const navigateToItem = (item: string) => {
    if (item === selectedCategory) {
      return;
    }
    const nextState = getNextState(item, activeSport, subCategories);
    const isNewItemLeaf = !categories.some(
      (c) => c.parentName === nextState.selectedCategory
    );
    const newHistoryItem: HistoryItem = {
      title: nextState.selectedCategory,
      state: nextState,
      isLeaf: isNewItemLeaf,
    };

    const uiGroupMap: Record<string, string[]> = {
      Shoes: ["All Shoes", "Lifestyle", "Athletic Shoes", "Dress Shoes"],
      Clothing: [
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
      Featured: categories
        .filter((c) => c.parentName === "Featured")
        .map((c) => c.name),
      "Shop By Sport": categories
        .filter((c) => c.parentName === "Shop By Sport")
        .map((c) => c.name),
    };
    const sports = ["Running", "Football", "Tennis", "Basketball"];
    const childToParentMap: Record<string, string> = {};
    for (const [parent, children] of Object.entries(uiGroupMap)) {
      for (const child of children) {
        childToParentMap[child] = parent;
      }
    }
    for (const sport of sports) {
      childToParentMap[sport] = "Shop By Sport";
    }
    for (const sport of sports) {
      const sportChildren = categories
        .filter((c) => c.parentName === sport)
        .map((c) => c.name);
      for (const sportChild of sportChildren) {
        childToParentMap[sportChild] = sport;
      }
    }
    for (const group of Object.keys(uiGroupMap)) {
      childToParentMap[group] = "All Products";
    }

    const currentHistoryItem = history[history.length - 1];
    const isCurrentItemLeaf = currentHistoryItem.isLeaf;
    const isSiblingClick = subCategories.includes(item);

    const clickedItemParent = childToParentMap[nextState.selectedCategory];

    if (isCurrentItemLeaf && isSiblingClick) {
      // CASE 1: REPLACE
      setHistory((prevHistory) => [
        ...prevHistory.slice(0, -1),
        newHistoryItem,
      ]);
    } else if (clickedItemParent && clickedItemParent === selectedCategory) {
      // CASE 2: APPEND
      setHistory((prevHistory) => [...prevHistory, newHistoryItem]);
    } else {
      // CASE 3: RESET
      const newHistory: HistoryItem[] = [];
      newHistory.push(history[0]); // Add "All Products"
      const path: string[] = [];
      let currentParent = childToParentMap[nextState.selectedCategory];
      while (currentParent && currentParent !== "All Products") {
        path.unshift(currentParent);
        currentParent = childToParentMap[currentParent];
      }
      for (const parentTitle of path) {
        const parentState = getNextState(parentTitle, null, []);
        const parentHistoryItem: HistoryItem = {
          title: parentTitle,
          state: parentState,
          isLeaf: false,
        };
        newHistory.push(parentHistoryItem);
      }
      newHistory.push(newHistoryItem);
      setHistory(newHistory);
    }
  };

  const navigateToHistory = (index: number) => {
    setHistory((prevHistory) => prevHistory.slice(0, index + 1));
  };

  // 1. Định nghĩa cấu hình CỐ ĐỊNH (Base Config)
  const baseFilterConfig = [
    { key: "Gender", titleBase: "Gender", options: ["Men", "Women", "Unisex"] },
    {
      key: "Shop By Price",
      titleBase: "Shop By Price",
      options: [
        "Under 1.000.000₫",
        "1.000.000₫ - 3.000.000₫",
        "Over 3.000.000₫",
      ],
    },
    {
      key: "Sale & Offers",
      titleBase: "Sale & Offers",
      options: ["On Sale", "Best Seller", "New Arrival"],
    },
    {
      key: "Size",
      titleBase: "Size",
      options: ["38", "39", "40", "41", "42", "43"],
    },
    {
      key: "Brand",
      titleBase: "Brand",
      options: ["Nike", "Adidas", "Puma", "Converse", "K-Swiss"],
    },
  ]; // 2. Tạo config ĐỘNG (Dynamic Config) bằng useMemo

  const filterConfig = useMemo(() => {
    return baseFilterConfig.map((filter) => {
      // Lấy số lượng đang được chọn cho key này
      const selectedCount = selectedFilters[filter.key]?.length || 0; // Tạo title mới
      const title =
        selectedCount > 0
          ? `${filter.titleBase} (${selectedCount})` // e.g., "Gender (1)"
          : filter.titleBase; // e.g., "Brand"

      return {
        ...filter,
        title: title, // Ghi đè title
      };
    });
  }, [selectedFilters, categories]); // Phụ thuộc vào selectedFilters

  const handleFilterToggle = (filterKey: string, option: string) => {
    setSelectedFilters((prevFilters) => {
      const currentSelections = prevFilters[filterKey] || [];
      const newSelections = currentSelections.includes(option)
        ? currentSelections.filter((item) => item !== option) // Bỏ chọn
        : [...currentSelections, option]; // Thêm chọn

      return {
        ...prevFilters,
        [filterKey]: newSelections,
      };
    });
  };

  return (
    <div>
      <TopBar
        groupedCategories={groupedCategories}
        groupedBrands={groupedBrands}
        onCategoryClick={navigateToItem}
      />

      <InforBar />
      <div className="flex-col">
        {/* Breadcrumbs (Layout gốc) */}
        <div className="flex items-center pt-[2rem] px-[5rem] gap-2 text-sm text-gray-600 flex-wrap">
          {history.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <span
                onClick={() => navigateToHistory(index)}
                className={`cursor-pointer ${
                  index === history.length - 1
                    ? "font-bold text-black"
                    : "hover:text-blue-600"
                } ${item.isLeaf ? "underline" : ""}`}
              >
                {item.title}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Title Section (Layout gốc) */}
        <div className="flex items-center pt-[1rem] px-[5rem] justify-between mb-4">
          <h2 className="text-3xl font-semibold">{selectedCategory}</h2>
          <div
            className="hide-filters md:gap-x-[1rem] gap-x-[0.5rem] flex items-center cursor-pointer"
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <h2 className="text-xl font-medium">
              {isFilterVisible ? "Hide Filters" : "Show Filters"}
            </h2>
            <IoOptionsOutline size={24} />
          </div>
        </div>

        {/* Content Section (Layout gốc) */}
        <div className="flex">
          {isFilterVisible && (
            <div className="w-[25%] pb-[2rem] pl-[5rem] pr-[3rem] h-[calc(80vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 transition-all duration-300">
              {subCategories.length > 0 && (
                <div className="flex flex-col gap-6 mb-4">
                  {subCategories.map((item) => (
                    <span
                      key={item}
                      className="text-gray-700 cursor-pointer hover:text-blue-600 transition"
                      onClick={() => navigateToItem(item)}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
              {filterConfig.map((filter) => (
                <FilterSection
                  key={filter.key}
                  title={filter.title}
                  options={filter.options}
                  // Truyền state và hàm xử lý xuống
                  selectedOptions={selectedFilters[filter.key]}
                  onToggleOption={(option) =>
                    handleFilterToggle(filter.key, option)
                  }
                />
              ))}
            </div>
          )}

          {/* Product Grid Container */}
          <div
            className={`p-6 transition-all duration-300 ${
              isFilterVisible ? "w-[75%]" : "w-full"
            }`}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p className="col-span-3 text-center text-gray-500">
                  No products found matching your criteria.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
