"use client";

import React, { useState, useEffect, useMemo } from "react";
import FilterSection from "@/utils/filterSection";
import { IoOptionsOutline } from "react-icons/io5";
import { getAllProducts, productRes } from "@/services/product";
import ProductCard from "@/utils/productCard";
import { useProductContext } from "@/context/ProductContext";

interface Category {
  name: string;
  parentName: string | null;
}

const getDescendants = (
  categories: Category[],
  parentName: string
): Set<string> => {
  const descendants = new Set<string>([parentName]); // Bao gồm cả chính nó

  const findChildren = (currentParentName: string) => {
    // Tìm các con trực tiếp
    const children = categories.filter(
      (c) => c.parentName === currentParentName
    );
    for (const child of children) {
      if (!descendants.has(child.name)) {
        descendants.add(child.name);
        findChildren(child.name); // Đệ quy để tìm các cháu
      }
    }
  };

  findChildren(parentName);
  return descendants;
};

const Product = () => {
  const {
    filterConfig,
    history,
    currentState,
    selectedFilters,
    navigateToItem,
    navigateToHistory,
    handleFilterToggle,
  } = useProductContext();

  const { selectedCategory, subCategories } = currentState;

  const [isFilterVisible, setIsFilterVisible] = useState(true);

  const [allProducts, setAllProducts] = useState<productRes[]>([]);

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

  const { categories } = useProductContext();
  const categoryParentMap = useMemo(() => {
    const map = new Map<string, string | null>();
    categories.forEach((cat) => {
      map.set(cat.name, cat.parentName);
    });
    map.set("Shoes", "All Products");
    map.set("Clothing", "All Products");
    map.set("Accessories", "All Products");
    map.set("Shop By Sport", "All Products");
    map.set("Featured", "All Products");
    return map;
  }, [categories]);

  // Lọc sản phẩm (filteredProducts) - Giữ nguyên logic này
  const filteredProducts = useMemo(() => {
    // 1. Tự động build 2 Set (tập hợp) lớn
    const ALL_SHOE_TYPES = new Set<string>();
    const ALL_CLOTHING_TYPES = new Set<string>();

    // Lấy con của "Shoes" (e.g., Lifestyle, All Shoes, Athletic Shoes, ...)
    getDescendants(categories, "Shoes").forEach((c) => ALL_SHOE_TYPES.add(c));

    // Lấy con của "Clothing" (e.g., All Clothing, Tops, Shorts, ...)
    getDescendants(categories, "Clothing").forEach((c) =>
      ALL_CLOTHING_TYPES.add(c)
    );

    // Lấy con của "Shop By Sport" (e.g., Running, Football, ...)
    // và thêm các "cháu" (Running Shoes, Running Clothing) vào 2 Set lớn
    const sports = getDescendants(categories, "Shop By Sport");
    sports.forEach((sport) => {
      // Lặp qua "Running", "Football", ...
      // Lấy con của từng sport (e.g., Running Shoes, Running Clothing)
      getDescendants(categories, sport).forEach((sportChild) => {
        if (sportChild.includes("Shoes")) {
          ALL_SHOE_TYPES.add(sportChild);
        }
        if (sportChild.includes("Clothing")) {
          ALL_CLOTHING_TYPES.add(sportChild);
        }
      });
    });

    // 2. Lọc Category
    let categoryFiltered = [];

    if (selectedCategory === "All Products") {
      categoryFiltered = allProducts;
    }
    // NẾU CLICK "All Shoes" hoặc "Shoes" -> Dùng Set Lớn
    else if (selectedCategory === "All Shoes" || selectedCategory === "Shoes") {
      categoryFiltered = allProducts.filter((p) =>
        ALL_SHOE_TYPES.has(p.categoryName)
      );
    }
    // NẾU CLICK "All Clothing" hoặc "Clothing" -> Dùng Set Lớn
    else if (
      selectedCategory === "All Clothing" ||
      selectedCategory === "Clothing"
    ) {
      categoryFiltered = allProducts.filter((p) =>
        ALL_CLOTHING_TYPES.has(p.categoryName)
      );
    }
    // LOGIC CŨ (Dùng cho "Running", "Running Shoes", "Lifestyle", v.v.)
    else {
      categoryFiltered = allProducts.filter((product) => {
        let currentCatName: string | null | undefined = product.categoryName;
        while (currentCatName) {
          if (currentCatName === selectedCategory) return true;
          currentCatName = categoryParentMap.get(currentCatName);
        }
        return false;
      });
    } // 3. Lọc Checkbox (Giữ nguyên logic cũ của bạn)

    const isFilterActive = Object.values(selectedFilters).some(
      (arr) => arr.length > 0
    );
    if (!isFilterActive) {
      return categoryFiltered;
    }
    return categoryFiltered.filter((product) => {
      for (const [filterKey, selectedOptions] of Object.entries(
        selectedFilters
      )) {
        if (selectedOptions.length === 0) continue;
        if (filterKey === "Gender") {
          const productSex = product.sex;
          const targetGenders = new Set(selectedOptions);
          if (targetGenders.has("Men") && targetGenders.has("Women")) {
            targetGenders.add("Unisex");
          }
          if (!targetGenders.has(productSex)) {
            return false;
          }
        } else if (filterKey === "Brand") {
          if (!selectedOptions.includes(product.brand)) {
            return false;
          }
        } else if (filterKey === "Shop By Price") {
          const passes = selectedOptions.some((option) => {
            if (option === "Under 1.000.000₫") return product.price < 1000000;
            if (option === "1.000.000₫ - 3.000.000₫")
              return product.price >= 1000000 && product.price <= 3000000;
            if (option === "Over 3.000.000₫") return product.price > 3000000;
            return false;
          });
          if (!passes) return false;
        }
      }
      return true;
    });
  }, [
    allProducts,
    selectedCategory,
    categoryParentMap,
    selectedFilters,
    categories,
  ]);

  return (
    <div className="flex-col">
      {/* Breadcrumbs (Layout gốc) */}
      <div className="flex items-center pt-[2rem] px-[3.5rem] gap-2 text-sm text-gray-600 flex-wrap">
        {history.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">/</span>}
            <span
              onClick={() => navigateToHistory(index)} // Dùng hàm từ context
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
      <div className="flex items-center pt-[1rem] px-[3.5rem] justify-between mb-4">
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
          <div className="w-[22%] pb-[2rem] pl-[3.5rem] pr-[2rem] h-[calc(80vh-180px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 transition-all duration-300">
            {subCategories.length > 0 && (
              <div className="flex flex-col gap-6 mb-4">
                {subCategories.map((item) => (
                  <span
                    key={item}
                    className="text-gray-700 cursor-pointer hover:text-blue-600 transition"
                    onClick={() => navigateToItem(item)} // Dùng hàm từ context
                  >
                    {item}
                  </span>
                ))}
              </div>
            )}
            {/* Dùng filterConfig từ context */}
            {filterConfig.map((filter) => (
              <FilterSection
                key={filter.key}
                title={filter.title}
                options={filter.options}
                selectedOptions={selectedFilters[filter.key]} // Dùng state từ context
                onToggleOption={
                  (option) => handleFilterToggle(filter.key, option) // Dùng hàm từ context
                }
              />
            ))}
          </div>
        )}

        {/* Product Grid Container */}
        <div
          className={`p-6 transition-all duration-300 ${
            isFilterVisible ? "w-[78%]" : "w-full"
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
  );
};

export default Product;
