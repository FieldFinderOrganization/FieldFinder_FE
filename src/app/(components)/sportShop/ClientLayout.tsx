"use client";

import React from "react";
import TopBar from "@/utils/topBar";
import InforBar from "@/utils/infoBar";
import { useProductContext } from "@/context/ProductContext";
import AIChat from "../ai/page";

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

  const [showChat, setShowChat] = React.useState(false);

  return (
    <>
      <TopBar
        groupedCategories={groupedCategories}
        groupedBrands={groupedBrands}
        onProductClick={navigateToItem}
        onBrandClick={handleBrandNavigation}
      />
        <InforBar />   {children} 
      {showChat && (
        <div className="fixed bottom-24 right-5 z-50 w-[350px] h-[450px] shadow-xl rounded-lg overflow-hidden">
          <AIChat onClose={() => setShowChat(false)} />
        </div>
      )}
    </>
  );
}
