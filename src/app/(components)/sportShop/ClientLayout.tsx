"use client";

import React from "react";
import TopBar from "@/utils/topBar"; // 👈 Sửa đường dẫn nếu cần
import InforBar from "@/utils/infoBar"; // 👈 Sửa đường dẫn nếu cần
import { useProductContext } from "@/context/ProductContext";
import { usePathname } from "next/navigation";

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

  const pathname = usePathname();

  return (
    <>
      <TopBar
        groupedCategories={groupedCategories}
        groupedBrands={groupedBrands}
        onProductClick={navigateToItem}
        onBrandClick={handleBrandNavigation}
      />
        <InforBar />   {children} 
    </>
  );
}
