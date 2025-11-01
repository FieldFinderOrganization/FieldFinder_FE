"use client";
import { Button, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { CiSearch } from "react-icons/ci";
import { GoHeart } from "react-icons/go";
import { BsCart2 } from "react-icons/bs";
import ava from "../../public/images/20.png";
import { IoIosArrowUp } from "react-icons/io";
import { useCart } from "@/context/CartContext";
import { useFavourite } from "@/context/FavouriteContext";
import Link from "next/link";
import { IoMdHeart } from "react-icons/io";

interface TopBarProps {
  groupedCategories: Record<string, string[]>;
  groupedBrands: Record<string, string[]>;
  onCategoryClick: (item: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  groupedCategories,
  groupedBrands,
  onCategoryClick,
}) => {
  const [searchInput, setSearchInput] = React.useState("");

  const [activeMenu, setActiveMenu] = React.useState<
    "product" | "brand" | null
  >(null);

  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const { getFavouriteCount, isFavourited } = useFavourite();
  const favCount = getFavouriteCount();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".menu-toggle") && !target.closest(".menu-content")) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuItemClick = (item: string) => {
    onCategoryClick(item);
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-wrap items-center px-6 py-6 lg:px-10 lg:py-8 justify-between">
      <div className="flex items-center md:gap-[10rem] gap-[5rem]">
        <Typography variant="h4" className="font-bold text-xl md:text-2xl">
          MTKICKs
        </Typography>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 md:gap-x-[8rem]">
          <div
            className="flex items-center md:gap-[1rem] cursor-pointer transition menu-toggle"
            onClick={() =>
              setActiveMenu((prev) => (prev === "product" ? null : "product"))
            }
          >
            <Typography
              variant="h6"
              className={`text-[1rem] whitespace-nowrap transition-all duration-200 ${
                activeMenu === "product"
                  ? "font-extrabold text-blue-600 scale-110"
                  : "font-normal text-gray-800"
              }`}
            >
              Product
            </Typography>
            {activeMenu === "product" ? (
              <IoIosArrowUp
                size={18}
                className="text-blue-600 transition-transform"
              />
            ) : (
              <IoIosArrowDown size={18} className="transition-transform" />
            )}
          </div>

          <div
            className="flex items-center md:gap-x-[1rem] cursor-pointer transition menu-toggle"
            onClick={() =>
              setActiveMenu((prev) => (prev === "brand" ? null : "brand"))
            }
          >
            <Typography
              variant="h6"
              className={`text-[1rem] whitespace-nowrap transition-all duration-200 ${
                activeMenu === "brand"
                  ? "font-extrabold text-blue-600 scale-110"
                  : "font-normal text-gray-800"
              }`}
            >
              Brand
            </Typography>
            {activeMenu === "brand" ? (
              <IoIosArrowUp
                size={18}
                className="text-blue-600 transition-transform"
              />
            ) : (
              <IoIosArrowDown size={18} className="transition-transform" />
            )}
          </div>
        </div>

        {/* --- Product Menu --- */}
        {activeMenu === "product" && (
          <div
            className={`absolute left-0 top-[6rem] w-full bg-white shadow-lg border-t border-gray-200 px-[8rem] py-8 flex justify-between gap-10 z-50 menu-content transition-all duration-300 ease-out ${
              activeMenu === "product"
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-4 invisible pointer-events-none"
            }`}
          >
            {Object.entries(groupedCategories).map(([title, items]) => (
              <div key={title} className="flex flex-col gap-2 min-w-[160px]">
                <Typography
                  variant="subtitle1"
                  className="font-bold text-[1rem]"
                >
                  {title}
                </Typography>
                {items.map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    className="text-gray-700 hover:text-blue-600 cursor-pointer"
                    // 🚨 Dùng handler mới
                    onClick={() => handleMenuItemClick(item)}
                  >
                    {item}
                  </Typography>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* --- Brand Menu --- */}
        {activeMenu === "brand" && (
          <div
            className={`absolute left-0 top-[6rem] w-full bg-white shadow-lg border-t border-gray-200 px-[8rem] py-8 flex justify-between gap-10 z-50 menu-content transition-all duration-300 ease-out ${
              activeMenu === "brand"
                ? "opacity-100 translate-y-0 visible"
                : "opacity-0 -translate-y-4 invisible pointer-events-none"
            }`}
          >
            {Object.entries(groupedBrands).map(([title, items]) => (
              <div key={title} className="flex flex-col gap-2 min-w-[160px]">
                <Typography
                  variant="subtitle1"
                  className="font-bold text-[1rem]"
                >
                  {title}
                </Typography>
                {items.map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    className="text-gray-700 hover:text-blue-600 cursor-pointer"
                    // 🚨 Dùng handler mới (giả sử click brand cũng dùng logic này)
                    onClick={() => handleMenuItemClick(item)}
                  >
                    {item}
                  </Typography>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* ... Phần search, icons ... */}
        <div className="hidden lg:flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 min-w-[280px] max-w-[600px] flex-1">
          <CiSearch size={20} className="cursor-pointer" />
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="outline-none bg-transparent text-sm flex-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/sportShop/favourites">
          <Tooltip title="Favourites">
            <Button className="relative">
              {isMounted && favCount > 0 ? (
                <IoMdHeart size={22} className="cursor-pointer text-red-600" />
              ) : (
                <GoHeart size={22} className="cursor-pointer text-gray-700" />
              )}
              {isMounted && favCount > 0 && (
                <span className="absolute top-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-medium text-white">
                  {favCount}
                </span>
              )}
            </Button>
          </Tooltip>
        </Link>

        <Link href="/sportShop/cart">
          <Tooltip title="Cart">
            <Button className="relative">
              <BsCart2 size={22} className="cursor-pointer text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-xs font-medium text-white">
                  {cartCount}
                </span>
              )}
            </Button>
          </Tooltip>
        </Link>

        <div className="rounded-full overflow-hidden w-10 h-10 cursor-pointer">
          <img
            src={ava.src}
            alt="avatar"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      <div className="flex lg:hidden items-center w-full mt-4 border border-gray-300 rounded-md px-3 py-2">
        <CiSearch size={20} className="cursor-pointer" />
        <input
          type="text"
          placeholder="Search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="outline-none bg-transparent ml-2 flex-1 text-sm"
        />
      </div>
    </div>
  );
};

export default TopBar;
