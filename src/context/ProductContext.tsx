/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { getAllCategory } from "@/services/category"; // Import service
import { useRouter } from "next/navigation"; // Import router

// --- Định nghĩa các types (giữ nguyên) ---
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

const INITIAL_FILTERS: Record<string, string[]> = {
  Gender: [],
  "Shop By Price": [],
  "Sale & Offers": [],
  Size: [],
  Brand: [],
};

interface ProductContextType {
  categories: Category[];
  groupedCategories: Record<string, string[]>;
  groupedBrands: Record<string, string[]>;
  filterConfig: any[];

  history: HistoryItem[];
  currentState: AppState;
  selectedFilters: Record<string, string[]>;
  searchTerm: string;

  navigateToItem: (item: string) => void;
  navigateToHistory: (index: number) => void;
  handleBrandNavigation: (brand: string, subCategory: string) => void;
  handleFilterToggle: (filterKey: string, option: string) => void;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
}

// --- Tạo Context ---
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// --- Tạo Provider (Component Cha bọc ngoài) ---
export const ProductProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter(); // Dùng router để điều hướng

  const [searchTerm, setSearchTerm] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    { title: "All Products", state: INITIAL_STATE, isLeaf: false },
  ]);
  const currentState = history[history.length - 1].state;
  const { selectedCategory, subCategories, activeSport } = currentState;

  const [categories, setCategories] = React.useState<Category[]>([]);

  const [selectedFilters, setSelectedFilters] =
    useState<Record<string, string[]>>(INITIAL_FILTERS);

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

  // groupedCategories
  const groupedCategories = useMemo(() => {
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

  // groupedBrands
  const groupedBrands = useMemo(() => {
    const brandNames = ["Nike", "Adidas", "Puma", "Converse", "K-Swiss"];
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
    brandNames.forEach((b) => {
      groups[b] = defaultSubItems;
    });
    return groups;
  }, [categories]);

  const filterConfig = useMemo(() => {
    const baseFilterConfig = [
      {
        key: "Gender",
        titleBase: "Gender",
        options: ["Men", "Women", "Unisex"],
      },
      {
        key: "Shop By Price",
        titleBase: "Shop By Price",
        options: [
          "Under 1.000.000₫",
          "1.000.000₫ - 3.000.000₫",
          "Over 3.000.000₫",
        ],
      },
      // {
      //   key: "Sale & Offers",
      //   titleBase: "Sale & Offers",
      //   options: ["On Sale", "Best Seller", "New Arrival"],
      // },
      // {
      //   key: "Size",
      //   titleBase: "Size",
      //   options: ["38", "39", "40", "41", "42", "43"],
      // },
      {
        key: "Brand",
        titleBase: "Brand",
        options: ["Nike", "Adidas", "Puma", "Converse", "K-Swiss"],
      },
    ];
    return baseFilterConfig.map((filter) => {
      const selectedCount = selectedFilters[filter.key]?.length || 0;
      const title =
        selectedCount > 0
          ? `${filter.titleBase} (${selectedCount})`
          : filter.titleBase;
      return { ...filter, title: title };
    });
  }, [selectedFilters, categories]);

  // getNextState
  const getNextState = (
    item: string,
    currentActiveSport: string | null,
    currentSubCategories: string[]
  ): AppState => {
    const uiGroupMap: Record<string, string[]> = {
      Shoes: [
        "All Shoes",
        "Lifestyle",
        "Gym And Training",
        "Sandals And Slides",
      ],
      "All Shoes": [
        "All Shoes",
        "Lifestyle",
        "Gym And Training",
        "Sandals And Slides",
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
      Featured: categories
        .filter((c) => c.parentName === "Featured")
        .map((c) => c.name),
      "Shop By Sport": categories
        .filter((c) => c.parentName === "Shop By Sport")
        .map((c) => c.name),
    };
    const sports = ["Running", "Football", "Tennis", "Basketball"];
    let subItems: string[] = [];
    const sport = currentActiveSport;
    if (sports.includes(item)) {
      return {
        selectedCategory: item,
        subCategories: ["Shoes", "Clothing", "Accessories"],
        activeSport: item,
      };
    }
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
    if (uiGroupMap[item]) {
      return {
        selectedCategory: item,
        subCategories: uiGroupMap[item],
        activeSport: null,
      };
    }
    for (const [key, values] of Object.entries(uiGroupMap)) {
      if (values.includes(item)) {
        return {
          selectedCategory: item,
          subCategories: uiGroupMap[key],
          activeSport: null,
        };
      }
    }
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

  const buildChildToParentMap = useCallback(() => {
    const uiGroupMap: Record<string, string[]> = {
      Shoes: [
        "All Shoes",
        "Lifestyle",
        "Gym And Training",
        "Sandals And Slides",
      ],
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
    return childToParentMap;
  }, [categories]);

  const buildNewHistory = (
    item: string,
    nextState: AppState,
    newHistoryItem: HistoryItem
  ) => {
    const childToParentMap = buildChildToParentMap();
    const currentHistoryItem = history[history.length - 1];
    const isCurrentItemLeaf = currentHistoryItem.isLeaf;
    const isSiblingClick = subCategories.includes(item);

    const clickedItemParent = childToParentMap[nextState.selectedCategory];

    if (isCurrentItemLeaf && isSiblingClick) {
      return (prevHistory: HistoryItem[]) => [
        ...prevHistory.slice(0, -1),
        newHistoryItem,
      ];
    } else if (clickedItemParent && clickedItemParent === selectedCategory) {
      return (prevHistory: HistoryItem[]) => [...prevHistory, newHistoryItem];
    } else {
      const newHistory: HistoryItem[] = [];
      newHistory.push(history[0]);
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
      return newHistory;
    }
  };

  // navigateToItem (SỬA LẠI ĐỂ CÓ router.push)
  const navigateToItem = (item: string) => {
    if (item === selectedCategory && !searchTerm) {
      // Nếu click lại category và không search -> không làm gì
      router.push("/sportShop/product");
      return;
    }

    // 1. Reset search và filter
    setSearchTerm("");
    setSelectedFilters(INITIAL_FILTERS); // 👈 RESET FILTER

    // 2. Tính toán History/State mới
    const nextState = getNextState(item, activeSport, subCategories);
    const isNewItemLeaf = !categories.some(
      (c) => c.parentName === nextState.selectedCategory
    );
    const newHistoryItem: HistoryItem = {
      title: nextState.selectedCategory,
      state: nextState,
      isLeaf: isNewItemLeaf,
    };

    // 3. Build History mới
    const newHistory = buildNewHistory(item, nextState, newHistoryItem);
    setHistory(newHistory);

    router.push("/sportShop/product");
  };

  // navigateToHistory
  const navigateToHistory = (index: number) => {
    setSearchTerm("");
    setSelectedFilters(INITIAL_FILTERS); // 👈 RESET FILTER
    setHistory((prevHistory) => prevHistory.slice(0, index + 1));
    router.push("/sportShop/product");
  };

  const handleBrandNavigation = (brand: string, subCategory: string) => {
    // 1. Xác định category và filter
    let targetCategory = "All Products";

    // 🚨 SỬA LỖI Ở ĐÂY 🚨
    // Thêm kiểu `Record<string, string[]>` để TypeScript hiểu
    const newFilters: Record<string, string[]> = {
      ...INITIAL_FILTERS,
      Brand: [brand],
    };

    if (
      subCategory === "Men" ||
      subCategory === "Women" ||
      subCategory === "Unisex"
    ) {
      newFilters.Gender = [subCategory];
      targetCategory = "All Clothing"; // Giả sử Men/Women là Clothing
    } else if (
      subCategory === "Shoes" ||
      subCategory === "Clothing" ||
      subCategory === "Accessories"
    ) {
      targetCategory = subCategory; // Target là "Shoes", "Clothing",...
    }

    // 2. Lấy state/history cho category
    const nextState = getNextState(targetCategory, activeSport, subCategories);
    const isNewItemLeaf = !categories.some(
      (c) => c.parentName === nextState.selectedCategory
    );
    const newHistoryItem: HistoryItem = {
      title: nextState.selectedCategory,
      state: nextState,
      isLeaf: isNewItemLeaf,
    };
    const newHistory = buildNewHistory(
      targetCategory,
      nextState,
      newHistoryItem
    );

    // 3. Set CẢ HAI state
    setHistory(newHistory);
    setSelectedFilters(newFilters);
    setSearchTerm("");

    // 4. Navigate
    router.push("/sportShop/product");
  };

  // handleFilterToggle
  const handleFilterToggle = (filterKey: string, option: string) => {
    setSelectedFilters((prevFilters) => {
      const currentSelections = prevFilters[filterKey] || [];
      const newSelections = currentSelections.includes(option)
        ? currentSelections.filter((item) => item !== option)
        : [...currentSelections, option];
      return { ...prevFilters, [filterKey]: newSelections };
    });
  };

  // --- Cung cấp giá trị cho Context ---
  const value = {
    categories,
    groupedCategories,
    groupedBrands,
    filterConfig,
    history,
    currentState,
    selectedFilters,
    searchTerm,
    navigateToItem,
    navigateToHistory,
    handleBrandNavigation,
    handleFilterToggle,
    setSearchTerm,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

// --- Tạo Hook tùy chỉnh (để dễ sử dụng) ---
export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProductContext must be used within a ProductProvider");
  }
  return context;
};
