"use client";

import React from "react";
import TopBar from "@/utils/topBar";
import InforBar from "@/utils/infoBar";
import { useProductContext } from "@/context/ProductContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    groupedCategories,
    groupedBrands,
    navigateToItem,
    handleBrandNavigation,
  } = useProductContext();

  return (
    <>
      <TopBar
        groupedCategories={groupedCategories}
        groupedBrands={groupedBrands}
        onProductClick={navigateToItem}
        onBrandClick={handleBrandNavigation}
      />
      <div className="pt-[90px] lg:pt-[112px]">
        <InforBar /> {children} 
      </div>
    </>
  );
}
