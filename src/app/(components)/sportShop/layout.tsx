"use client";

import React from "react";
import { ProductProvider } from "@/context/ProductContext";
import { CartProvider } from "@/context/CartContext";
import { FavouriteProvider } from "@/context/FavouriteContext";
import ClientLayout from "./ClientLayout";

export default function SportShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <ProductProvider>
        <FavouriteProvider>
          <ClientLayout>{children}</ClientLayout>
        </FavouriteProvider>
      </ProductProvider>
    </CartProvider>
  );
}
