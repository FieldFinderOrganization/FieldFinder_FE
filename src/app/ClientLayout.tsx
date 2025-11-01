"use client";

import React from "react";
import TopBar from "@/utils/topBar";
import InforBar from "@/utils/infoBar";
import { useProductContext } from "@/context/ProductContext";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { groupedCategories, groupedBrands, navigateToItem } =
    useProductContext();
  const pathname = usePathname();

  return (
    <>
      <TopBar
        groupedCategories={groupedCategories}
        groupedBrands={groupedBrands}
        onCategoryClick={navigateToItem}
      />
      <InforBar />

      {children}
    </>
  );
}
