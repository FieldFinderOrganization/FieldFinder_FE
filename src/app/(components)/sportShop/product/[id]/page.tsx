"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductById, productRes } from "@/services/product";
import { IoMdHeartEmpty } from "react-icons/io";
import { MdArrowBackIos, MdArrowForwardIos } from "react-icons/md";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useCart } from "@/context/CartContext";
import { useFavourite } from "@/context/FavouriteContext"; // 👈 Đã thêm
import { IoMdHeart } from "react-icons/io";
import { toast } from "react-toastify";

const MOCK_SIZES = [
  "Size 36",
  "Size 37",
  "Size 38",
  "Size 39",
  "Size 40",
  "Size 41",
  "Size 42",
  "Size 43",
  "Size 44",
];

const PrevArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/50 rounded-full hover:bg-white transition"
    >
      <MdArrowBackIos className="text-black" />
    </button>
  );
};

const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <button
      onClick={onClick}
      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/50 rounded-full hover:bg-white transition"
    >
            <MdArrowForwardIos className="text-black" />
    </button>
  );
};

const ProductDetailPage = () => {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<productRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const [nav1, setNav1] = useState<Slider | null>(null);
  const [nav2, setNav2] = useState<Slider | null>(null);

  const { addToCart } = useCart();
  const { toggleFavourite, isFavourited } = useFavourite();

  const mockImageGallery = product
    ? [
        product.imageUrl,
        "https://res.cloudinary.com/dxgy8ilqu/image/upload/e_background_removal/f_png/15_bocx9z?_a=BAMAMiWO0",
        "https://res.cloudinary.com/dxgy8ilqu/image/upload/e_background_removal/f_png/16_jgbo1e?_a=BAMAMiWO0",
        "https://res.cloudinary.com/dxgy8ilqu/image/upload/e_background_removal/f_png/17_fbzoui?_a=BAMAMiWO0",
        "https://res.cloudinary.com/dxgy8ilqu/image/upload/e_background_removal/f_png/18_lcktzx?_a=BAMAMiWO0",
        "https://res.cloudinary.com/dxgy8ilqu/image/upload/e_background_removal/f_png/19_hqozfo?_a=BAMAMiWO0",
      ]
    : [];
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const data = await getProductById(id);
          setProduct(data);
          setError(null);
        } catch (err) {
          setError("Failed to fetch product.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);
  const mainSliderSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    fade: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
  };
  const thumbSliderSettings = {
    slidesToShow: 6,
    slidesToScroll: 1,
    vertical: true,
    verticalSwiping: true,
    focusOnSelect: true,
    centerMode: false,
    arrows: false,
  };
  const formattedPrice = product
    ? new Intl.NumberFormat("vi-VN").format(product.price)
    : "";

  if (loading) {
    return (
      <div className="flex-col">
        <p className="text-center p-10">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-col">
               {" "}
        <p className="text-center p-10 text-red-600">
           {error || "Product not found."}
        </p>
      </div>
    );
  }

  const isFav = product ? isFavourited(product.id) : false;

  return (
    <div className="flex-col">
      <div className="container mx-auto max-w-6xl p-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex gap-4">
            <div className="w-1/6">
              <Slider
                {...thumbSliderSettings}
                asNavFor={nav1 || undefined}
                ref={(slider) => setNav2(slider)}
                className="product-thumbs-slider"
              >
                {mockImageGallery.map((img, index) => (
                  <div key={index} className="p-1 cursor-pointer">
                    <img
                      src={img}
                      alt={`Thumb ${index + 1}`}
                      className="w-full h-auto object-cover rounded-md border border-gray-200"
                    />
                  </div>
                ))}
              </Slider>
            </div>
            <div className="w-5/6">
              <Slider
                {...mainSliderSettings}
                asNavFor={nav2 || undefined}
                ref={(slider) => setNav1(slider)}
                className="product-main-slider"
              >
                {mockImageGallery.map((img, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg">
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-auto object-cover aspect-square rounded-lg"
                    />
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-600 text-lg">{product.description}</p>
            <p className="text-2xl font-semibold">VND {formattedPrice}</p>
            <div>
              <h3 className="text-lg font-medium mb-2">Select size</h3>
              <div className="grid grid-cols-3 gap-2">
                {MOCK_SIZES.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border rounded-md p-3 text-center transition-colors ${selectedSize === size ? "bg-black text-white border-black" : "border-gray-300 hover:border-black cursor-pointer"}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <a
                href="#"
                className="text-sm text-gray-500 mt-2 block underline"
              >
                Can't find your size? Click here
              </a>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <button
                onClick={async () => {
                  if (!selectedSize) {
                    toast.warn("Please select a size.");
                    return;
                  }
                  if (product) {
                    await addToCart(product, selectedSize);
                  }
                }}
                disabled={!selectedSize}
                className="bg-green-600 text-white p-4 rounded-full text-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
              >
                Add to Cart
              </button>
              <button
                onClick={() => product && toggleFavourite(product)}
                className="border border-gray-300 p-4 rounded-full text-lg font-medium hover:border-black transition-colors flex items-center justify-center cursor-pointer"
              >
                {isFav ? "Remove from Favourite" : "Add to Favorite"}           
                {isFav ? (
                  <IoMdHeart size={22} className="text-red-500" />
                ) : (
                  <IoMdHeartEmpty size={22} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
