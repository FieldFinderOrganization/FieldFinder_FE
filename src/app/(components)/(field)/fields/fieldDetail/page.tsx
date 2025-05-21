"use client";
import Header from "@/utils/header";
import { Typography } from "@mui/material";
import React from "react";
import f from "../../../../../public/images/field3.jpg";

const FieldDetail: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex items-start justify-center gap-x-[2rem] max-w-7xl w-full px-4 mt-[1rem]">
        <Typography variant="h5">Hello World</Typography>
      </div>
    </div>
  );
};

export default FieldDetail;
