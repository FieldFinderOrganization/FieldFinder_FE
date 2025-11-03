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
    searchTerm,
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

  const filteredProducts = useMemo(() => {
    // 1. Định nghĩa các "danh mục chức năng" (từ Clothing, Shoes, Accessories)
    const functionalCategories = [
      "Lifestyle",
      "Athletic Shoes",
      "Dress Shoes",
      "Tops And T-Shirts",
      "Shorts",
      "Pants And Leggings",
      "Hoodies And Sweatshirts",
      "Jackets And Gilets",
      "Gloves",
      "Socks",
      "Hats And Headwears",
      "Bags And Backpacks",
    ];

    // 2. 👈 SỬA: Map "Siêu-Set" giờ sẽ lưu ID sản phẩm (number)
    const categorySuperSetMap = new Map<string, Set<number>>();
    functionalCategories.forEach((catName) => {
      categorySuperSetMap.set(catName, new Set<number>()); // 👈 Set rỗng chứa number
    });

    // 3. 👈 SỬA: "Siêu-Set" cho "All" cũng lưu ID sản phẩm (number)
    const ALL_SHOE_TYPES = new Set<number>();
    const ALL_CLOTHING_TYPES = new Set<number>();
    const ALL_ACCESSORIES_TYPES = new Set<number>(); // 4. "Dạy" cho logic lọc (PHẦN SỬA LỖI NẰM Ở ĐÂY)

    // ⛔⛔⛔
    // KHỐI LỒNG NHAU (Dòng 128-139) ĐÃ BỊ XOÁ KHỎI ĐÂY
    // ⛔⛔⛔

    allProducts.forEach((product) => {
      const catName = product.categoryName;
      const productName = product.name.toLowerCase();
      const productId = product.id; // 👈 Lấy ID
      // 4a. Học từ category của sport (ví dụ: "Football Clothing" -> "Clothing")
      // Dùng logic phân cấp (cha-con) để xác định

      let currentCat: string | null | undefined = catName;
      while (currentCat) {
        if (currentCat === "Shoes") ALL_SHOE_TYPES.add(productId);
        if (currentCat === "Clothing") ALL_CLOTHING_TYPES.add(productId);
        if (currentCat === "Accessories") ALL_ACCESSORIES_TYPES.add(productId);
        // Dùng categoryParentMap (từ bên ngoài, đã được truyền vào dependency)
        currentCat = categoryParentMap.get(currentCat);
      } // Check Shorts / Skirts

      // 4b. Học từ tên sản phẩm (Logic tường minh)
      if (categorySuperSetMap.has("Shorts")) {
        const shortsRegex = /\bshort(s)?\b/i;
        const skirtRegex = /\b(skirt|skirts)\b/i;
        const isShortSleeve = productName.includes("short sleeve");
        if (
          (shortsRegex.test(productName) && !isShortSleeve) ||
          skirtRegex.test(productName)
        ) {
          categorySuperSetMap.get("Shorts")!.add(productId);
        }
      } // Check Tops / T-Shirts

      if (categorySuperSetMap.has("Tops And T-Shirts")) {
        if (
          productName.includes("shirt") ||
          productName.includes("top") ||
          productName.includes("tee") ||
          productName.includes("jersey")
        ) {
          categorySuperSetMap.get("Tops And T-Shirts")!.add(productId);
        }
      } // Check Hoodies / Sweatshirts

      if (categorySuperSetMap.has("Hoodies And Sweatshirts")) {
        if (
          productName.includes("hoodie") ||
          productName.includes("sweatshirt")
        ) {
          categorySuperSetMap.get("Hoodies And Sweatshirts")!.add(productId);
        }
      } // Check Pants / Leggings

      if (categorySuperSetMap.has("Pants And Leggings")) {
        if (productName.includes("pant") || productName.includes("legging")) {
          categorySuperSetMap.get("Pants And Leggings")!.add(productId);
        }
      } // Check Jackets

      if (categorySuperSetMap.has("Jackets And Gilets")) {
        if (productName.includes("jacket") || productName.includes("gilet")) {
          categorySuperSetMap.get("Jackets And Gilets")!.add(productId);
        }
      }
    }); // 5. Bắt đầu Lọc (Filtering) - (SỬA LẠI HOÀN TOÀN)

    let categoryFiltered = [];

    if (selectedCategory === "All Products") {
      categoryFiltered = allProducts;
    } else if (
      selectedCategory === "All Shoes" ||
      selectedCategory === "Shoes"
    ) {
      // Lọc theo "All" (dùng Siêu-Set ID)
      categoryFiltered = allProducts.filter((p) => ALL_SHOE_TYPES.has(p.id));
    } else if (
      selectedCategory === "All Clothing" ||
      selectedCategory === "Clothing"
    ) {
      categoryFiltered = allProducts.filter((p) =>
        ALL_CLOTHING_TYPES.has(p.id)
      );
    } else if (categorySuperSetMap.has(selectedCategory)) {
      // Lọc theo "Chức năng" (dùng Siêu-Set Map ID)
      const matchingProductIds = categorySuperSetMap.get(selectedCategory)!;
      categoryFiltered = allProducts.filter((p) =>
        matchingProductIds.has(p.id)
      );
    } // Lọc theo Phân cấp (Fallback cho "Running", "Football", v.v.)
    else {
      const matchingCategories = getDescendants(categories, selectedCategory);
      categoryFiltered = allProducts.filter((p) =>
        matchingCategories.has(p.categoryName)
      );
    }

    // 6. Lọc theo Search Term
    let searchFiltered = categoryFiltered;
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      searchFiltered = categoryFiltered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerCaseSearch) ||
          product.description.toLowerCase().includes(lowerCaseSearch) ||
          product.brand.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // 7. Lọc theo Checkbox (Filters)
    const isFilterActive = Object.values(selectedFilters).some(
      (arr) => arr.length > 0
    );

    if (!isFilterActive) {
      return searchFiltered;
    }

    return searchFiltered.filter((product) => {
      for (const [filterKey, selectedOptions] of Object.entries(
        selectedFilters
      )) {
        if (selectedOptions.length === 0) continue;
        if (filterKey === "Gender") {
          const productSex = product.sex;
          const targetGenders = new Set(selectedOptions);
          if (targetGenders.has("Men") || targetGenders.has("Women")) {
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
            section: if (option === "Over 3.000.000₫")
              return product.price > 3000000;
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
    searchTerm,
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
