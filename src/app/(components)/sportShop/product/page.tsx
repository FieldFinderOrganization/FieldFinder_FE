"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import FilterSection from "@/utils/filterSection";
import { IoOptionsOutline } from "react-icons/io5";
import { getAllProducts, productRes } from "@/services/product";
import ProductCard from "@/utils/productCard";
import { useProductContext } from "@/context/ProductContext";
import { HiOutlineArrowDown } from "react-icons/hi"; //
import { motion } from "framer-motion";

interface Category {
  name: string;
  parentName: string | null;
}

const getDescendants = (
  categories: Category[],
  parentName: string
): Set<string> => {
  const descendants = new Set<string>([parentName]);

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

  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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
    // 1. Định nghĩa các "danh mục chức năng"
    const functionalCategories = [
      "Lifestyle",
      "Athletic Shoes",
      "Dress Shoes",
      "Gym And Training",
      "Sandals And Slides",
      "Tops And T-Shirts",
      "Shorts",
      "Pants And Leggings",
      "Hoodies And Sweatshirts",
      "Jackets And Gilets",
      "Gloves",
      "Socks",
      "Hats And Headwears",
      "Bags And Backpacks",
    ]; // 2. Map "Siêu-Set" (lưu ID sản phẩm)

    const categorySuperSetMap = new Map<string, Set<number>>();
    functionalCategories.forEach((catName) => {
      categorySuperSetMap.set(catName, new Set<number>());
    }); // 3. "Siêu-Set" cho "All" (lưu ID sản phẩm)

    const ALL_SHOE_TYPES = new Set<number>();
    const ALL_CLOTHING_TYPES = new Set<number>();
    const ALL_ACCESSORIES_TYPES = new Set<number>(); // 4. "Dạy" cho logic lọc

    allProducts.forEach((product) => {
      const catName = product.categoryName;
      const productName = product.name.toLowerCase();
      const productId = product.id; // 4a. Học từ phân cấp (cha-con)

      let currentCat: string | null | undefined = catName;
      while (currentCat) {
        if (currentCat === "Shoes") ALL_SHOE_TYPES.add(productId);
        if (currentCat === "Clothing") ALL_CLOTHING_TYPES.add(productId);
        if (currentCat === "Accessories") ALL_ACCESSORIES_TYPES.add(productId);
        // Dùng `categoryParentMap` (từ cấp cao nhất)
        currentCat = categoryParentMap.get(currentCat);
      } // 4b. Học từ category CHÍNH XÁC

      if (categorySuperSetMap.has(catName)) {
        categorySuperSetMap.get(catName)!.add(productId);
      } // 4c. Học từ tên sản phẩm (Logic "thông minh" hơn)

      // (Logic "học" cho Shoes, Clothing, Accessories... giữ nguyên)
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
      }
      if (categorySuperSetMap.has("Tops And T-Shirts")) {
        if (
          productName.includes("shirt") ||
          productName.includes("top") ||
          productName.includes("tee") ||
          productName.includes("jersey")
        ) {
          categorySuperSetMap.get("Tops And T-Shirts")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Hoodies And Sweatshirts")) {
        if (
          productName.includes("hoodie") ||
          productName.includes("sweatshirt")
        ) {
          categorySuperSetMap.get("Hoodies And Sweatshirts")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Pants And Leggings")) {
        if (productName.includes("pant") || productName.includes("legging")) {
          categorySuperSetMap.get("Pants And Leggings")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Jackets And Gilets")) {
        if (productName.includes("jacket") || productName.includes("gilet")) {
          categorySuperSetMap.get("Jackets And Gilets")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Gym And Training")) {
        if (productName.includes("gym") || productName.includes("training")) {
          categorySuperSetMap.get("Gym And Training")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Sandals And Slides")) {
        if (productName.includes("sandal") || productName.includes("slide")) {
          categorySuperSetMap.get("Sandals And Slides")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Gloves")) {
        if (productName.includes("glove")) {
          categorySuperSetMap.get("Gloves")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Socks")) {
        const sockRegex = /\bsock(s)?\b/i;
        if (sockRegex.test(productName)) {
          categorySuperSetMap.get("Socks")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Hats And Headwears")) {
        if (
          productName.includes("hat") ||
          productName.includes("cap") ||
          productName.includes("headwear") ||
          productName.includes("beanie")
        ) {
          categorySuperSetMap.get("Hats And Headwears")!.add(productId);
        }
      }
      if (categorySuperSetMap.has("Bags And Backpacks")) {
        const hasBag = productName.includes("bag");
        const hasBackpack = productName.includes("backpack");
        const packRegex = /\bpack\b/i;
        const multiPackRegex = /\b\d+\s*pack\b/i;
        if (
          hasBag ||
          hasBackpack ||
          (packRegex.test(productName) && !multiPackRegex.test(productName))
        ) {
          categorySuperSetMap.get("Bags And Backpacks")!.add(productId);
        }
      }
    });

    // 5. Hợp nhất (Logic này đúng, giữ nguyên)
    categorySuperSetMap
      .get("Gloves")!
      .forEach((id) => ALL_ACCESSORIES_TYPES.add(id));
    categorySuperSetMap
      .get("Socks")!
      .forEach((id) => ALL_ACCESSORIES_TYPES.add(id));
    categorySuperSetMap
      .get("Hats And Headwears")!
      .forEach((id) => ALL_ACCESSORIES_TYPES.add(id));
    categorySuperSetMap
      .get("Bags And Backpacks")!
      .forEach((id) => ALL_ACCESSORIES_TYPES.add(id));
    // (Hợp nhất Shoes)
    categorySuperSetMap
      .get("Lifestyle")!
      .forEach((id) => ALL_SHOE_TYPES.add(id));
    categorySuperSetMap
      .get("Gym And Training")!
      .forEach((id) => ALL_SHOE_TYPES.add(id));
    categorySuperSetMap
      .get("Sandals And Slides")!
      .forEach((id) => ALL_SHOE_TYPES.add(id));
    categorySuperSetMap
      .get("Athletic Shoes")!
      .forEach((id) => ALL_SHOE_TYPES.add(id));
    categorySuperSetMap
      .get("Dress Shoes")!
      .forEach((id) => ALL_SHOE_TYPES.add(id));
    // (Hợp nhất Clothing)
    categorySuperSetMap
      .get("Tops And T-Shirts")!
      .forEach((id) => ALL_CLOTHING_TYPES.add(id));
    categorySuperSetMap
      .get("Shorts")!
      .forEach((id) => ALL_CLOTHING_TYPES.add(id));
    categorySuperSetMap
      .get("Pants And Leggings")!
      .forEach((id) => ALL_CLOTHING_TYPES.add(id));
    categorySuperSetMap
      .get("Hoodies And Sweatshirts")!
      .forEach((id) => ALL_CLOTHING_TYPES.add(id));
    categorySuperSetMap
      .get("Jackets And Gilets")!
      .forEach((id) => ALL_CLOTHING_TYPES.add(id));

    let categoryFiltered = [];
    if (selectedCategory === "All Products") {
      categoryFiltered = allProducts;
    } else if (
      selectedCategory === "All Shoes" ||
      selectedCategory === "Shoes"
    ) {
      categoryFiltered = allProducts.filter((p) => ALL_SHOE_TYPES.has(p.id));
    } else if (
      selectedCategory === "All Clothing" ||
      selectedCategory === "Clothing"
    ) {
      categoryFiltered = allProducts.filter((p) =>
        ALL_CLOTHING_TYPES.has(p.id)
      );
    } else if (
      selectedCategory === "All Accessories" ||
      selectedCategory === "Accessories"
    ) {
      categoryFiltered = allProducts.filter((p) =>
        ALL_ACCESSORIES_TYPES.has(p.id)
      );
    } else if (categorySuperSetMap.has(selectedCategory)) {
      const matchingProductIds = categorySuperSetMap.get(selectedCategory)!;
      categoryFiltered = allProducts.filter((p) =>
        matchingProductIds.has(p.id)
      );
    } else {
      const matchingCategories = getDescendants(categories, selectedCategory);
      categoryFiltered = allProducts.filter((p) =>
        matchingCategories.has(p.categoryName)
      );
    } // 7. Lọc theo Search Term

    let searchFiltered = categoryFiltered;
    if (searchTerm) {
      const searchWords = searchTerm
        .toLowerCase()
        .split(" ")
        .filter((w) => w.length > 0);
      searchFiltered = categoryFiltered.filter((product) => {
        const productName = product.name.toLowerCase();
        const productBrand = product.brand.toLowerCase();
        return searchWords.every((word) => {
          const regex = new RegExp(`\\b${word}`, "i");
          return regex.test(productName) || regex.test(productBrand);
        });
      });
    } // 8. Lọc theo Checkbox (Filters)

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

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  // 4. 👈 RESET "LOAD MORE" KHI FILTER THAY ĐỔI
  useEffect(() => {
    setVisibleCount(9);
  }, [filteredProducts]); // 👈 Reset khi filter thay đổi

  // 5. 👈 LOGIC "INFINITE SCROLL"
  const observerRef = useRef(null); // Ref cho phần tử "trigger"

  const handleLoadMore = useCallback(() => {
    setIsLoadingMore(true);
    // Giả lập 1 chút delay cho đẹp
    setTimeout(() => {
      setVisibleCount((prevCount) => prevCount + 9);
      setIsLoadingMore(false);
    }, 300); // 300ms delay
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Nếu trigger (observerRef) xuất hiện trên màn hình
        if (
          entries[0].isIntersecting &&
          !isLoadingMore &&
          visibleCount < filteredProducts.length
        ) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 } // 100% của trigger phải lọt vào view
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [
    observerRef,
    handleLoadMore,
    isLoadingMore,
    visibleCount,
    filteredProducts.length,
  ]);

  // 6. 👈 SỬA LẠI JSX (RETURN)

  // Định nghĩa variants cho animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Delay 0.05s giữa mỗi card
      },
    },
  };

  return (
    <div className="flex-col">
      {/* Breadcrumbs (Layout gốc) */}
      <div className="flex items-center px-[3.5rem] gap-2 text-sm text-gray-600 flex-wrap">
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
      <div className="flex items-center pt-[1rem] px-[3.5rem] justify-between mb-4 ">
        <h2 className="text-3xl font-semibold ">{selectedCategory}</h2>
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
        {isFilterVisible && ( // 👈 SỬA: Tinh chỉnh CSS của Sidebar
          <div
            className="w-[22%] pb-[2rem] pl-[3.5rem] pr-[2rem]
                       transition-all duration-300 
                       sticky top-28 self-start 
                       h-[calc(100vh_-_8rem)] // 100vh - (top-28 (7rem) + 1rem padding)
                       overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
          >
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
                selectedOptions={selectedFilters[filter.key]}
                onToggleOption={(option) =>
                  handleFilterToggle(filter.key, option)
                }
              />
            ))}
          </div>
        )}

        <div
          className={`p-6 transition-all duration-300 ${
            isFilterVisible ? "w-[78%]" : "w-full"
          }`}
        >
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {visibleProducts.length > 0 ? (
              visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="col-span-3 text-center text-gray-500">
                 No products found matching your criteria.      
              </p>
            )}
          </motion.div>

          <div ref={observerRef} className="h-10 w-full" />
          {isLoadingMore && (
            <div className="flex justify-center items-center p-6">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Product;
