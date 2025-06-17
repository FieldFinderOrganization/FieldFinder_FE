"use client";

import Header from "@/utils/header";
import { Card, Typography } from "@mui/material";
import { FaSearch, FaStar, FaStarHalfAlt } from "react-icons/fa";
import f from "../../../../../public/images/field3.jpg";
import { CiStar } from "react-icons/ci";
import { useEffect, useState } from "react";
import { getAllAddresses } from "@/services/provider";
import { getAllPitches } from "@/services/pitch";
import { getAverageRating } from "@/services/review";
import { useRouter, useSearchParams } from "next/navigation";

interface Address {
  providerAddressId: string;
  address: string;
}

interface Pitch {
  pitchId: string;
  providerAddressId: string;
  name: string;
  type: "FIVE_A_SIDE" | "SEVEN_A_SIDE" | "ELEVEN_A_SIDE";
  price: number;
  description?: string;
}

const FieldLists: React.FC = () => {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredAddresses, setFilteredAddresses] = useState<Address[]>([]);
  const [basePitches, setBasePitches] = useState<Pitch[]>([]);
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  const searchParams = useSearchParams();
  const pitchIdsParam = searchParams.get("pitchIds");
  const availablePitchIds = pitchIdsParam ? pitchIdsParam.split(",") : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addressesData, pitchesData] = await Promise.all([
          getAllAddresses(),
          getAllPitches(),
        ]);

        setAddresses(addressesData);

        const initialPitches = pitchIdsParam
          ? pitchesData.filter((pitch) =>
              availablePitchIds.includes(pitch.pitchId)
            )
          : pitchesData;

        setBasePitches(initialPitches);
        setFilteredAddresses(
          getAddressesForPitches(addressesData, initialPitches)
        );

        const pitchRatings: { [key: string]: number } = {};
        await Promise.all(
          initialPitches.map(async (pitch) => {
            try {
              const rating = await getAverageRating(pitch.pitchId);
              pitchRatings[pitch.pitchId] = rating;
            } catch (error) {
              console.error(
                `Error fetching rating for pitch ${pitch.pitchId}:`,
                error
              );
              pitchRatings[pitch.pitchId] = 0;
            }
          })
        );
        setRatings(pitchRatings);

        updateSelectedAddress(
          getAddressesForPitches(addressesData, initialPitches)
        );

        setSearchTerm("");
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    };

    fetchData();
  }, [pitchIdsParam]);

  const getAddressesForPitches = (addresses: Address[], pitches: Pitch[]) => {
    const addressIds = [
      ...new Set(pitches.map((pitch) => pitch.providerAddressId)),
    ];
    return addresses.filter((addr) =>
      addressIds.includes(addr.providerAddressId)
    );
  };

  const updateSelectedAddress = (addresses: Address[]) => {
    setSelectedAddressId(
      addresses.length > 0 ? addresses[0].providerAddressId : null
    );
  };

  useEffect(() => {
    const filtered = searchTerm
      ? basePitches.filter((pitch) =>
          pitch.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : basePitches;

    const addressesForPitches = getAddressesForPitches(addresses, filtered);
    setFilteredAddresses(addressesForPitches);

    if (
      !selectedAddressId ||
      !addressesForPitches.some(
        (addr) => addr.providerAddressId === selectedAddressId
      )
    ) {
      updateSelectedAddress(addressesForPitches);
    }

    const pitchesForSelectedAddress = selectedAddressId
      ? filtered.filter(
          (pitch) => pitch.providerAddressId === selectedAddressId
        )
      : [];

    setPitches(pitchesForSelectedAddress);
  }, [searchTerm, basePitches, addresses, selectedAddressId]);

  const handleAreaClick = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const getPitchCount = (addressId: string) => {
    return basePitches.filter((pitch) => pitch.providerAddressId === addressId)
      .length;
  };

  const handlePitchClick = (pitch: Pitch) => {
    const address =
      addresses.find(
        (addr) => addr.providerAddressId === pitch.providerAddressId
      )?.address || "Không xác định";

    router.push(
      `fields/fieldDetail?${new URLSearchParams({
        id: pitch.pitchId,
        name: pitch.name,
        type: pitch.type,
        price: pitch.price.toString(),
        description: pitch.description || "Không có mô tả",
        address: address,
        rating: (ratings[pitch.pitchId] || 0).toFixed(1),
      }).toString()}`
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const starRating = rating / 2;
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-green-600 text-[0.7rem]" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt key={i} className="text-green-600 text-[0.7rem]" />
        );
      } else {
        stars.push(<CiStar key={i} className="text-[0.8rem] text-green-600" />);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex items-start justify-center gap-x-[2rem] max-w-7xl w-full px-4 mt-[1rem] mx-auto">
        <div className="search-tabs w-[20%] flex flex-col gap-y-[1rem] max-w-[250px] bg-white rounded-[10px] shadow-md px-[1.5rem] py-[1rem]">
          <div className="input-container relative">
            <FaSearch className="absolute left-[1rem] top-[50%] translate-y-[-50%] text-[#aaa] cursor-pointer" />
            <input
              type="text"
              placeholder="Tìm sân..."
              className="w-full h-[3rem] rounded-[10px] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 px-[3rem] py-[1rem]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredAddresses.length > 0 ? (
            <div className="areas gap-y-[0.75rem] flex flex-col">
              {filteredAddresses.map((address) => (
                <div
                  key={address.providerAddressId}
                  className={`w-full h-[3rem] rounded-[10px] border border-gray-600 px-[2rem] py-[1rem] flex items-center justify-between cursor-pointer ${
                    selectedAddressId === address.providerAddressId
                      ? "bg-[#188862]"
                      : "bg-white"
                  } hover:bg-blue-500 transition duration-200 ease-in-out area`}
                  onClick={() => handleAreaClick(address.providerAddressId)}
                >
                  <Typography
                    variant="body1"
                    color={
                      selectedAddressId === address.providerAddressId
                        ? "white"
                        : "black"
                    }
                    fontWeight={700}
                  >
                    {address.address}
                  </Typography>
                  <Typography
                    variant="body1"
                    color={
                      selectedAddressId === address.providerAddressId
                        ? "white"
                        : "black"
                    }
                    fontWeight={700}
                  >
                    {getPitchCount(address.providerAddressId)}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Không có khu vực
            </Typography>
          )}
        </div>
        <div className="w-[73%] flex flex-col items-center gap-y-[2rem]">
          <Typography variant="h5" fontWeight={700}>
            Danh sách sân
          </Typography>
          {pitches.length > 0 ? (
            <div className="pitches grid grid-cols-3 gap-y-[2rem] gap-x-[3rem]">
              {pitches.map((pitch) => (
                <Card
                  key={pitch.pitchId}
                  className="w-[250px] h-[220px] bg-white rounded-[10px] shadow-md flex flex-col items-start gap-y-[0.8rem] cursor-pointer"
                  onClick={() => handlePitchClick(pitch)}
                >
                  <img
                    src={f.src}
                    alt="Field"
                    className="w-full h-[95px] rounded-t-[10px] object-cover"
                  />
                  <div className="content flex flex-col gap-y-[0.2rem] ml-[1rem]">
                    <div className="ratings flex items-start gap-x-[0.5rem]">
                      {renderStars(ratings[pitch.pitchId] || 0)}
                    </div>
                    <Typography fontWeight={700}>
                      Sân {pitch.name} (sân{" "}
                      {pitch.type === "FIVE_A_SIDE"
                        ? 5
                        : pitch.type === "SEVEN_A_SIDE"
                          ? 7
                          : 11}
                      )
                    </Typography>
                    <Typography>{pitch.price} VNĐ</Typography>
                    <div className="flex items-center gap-x-[0.5rem]">
                      <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                        {(ratings[pitch.pitchId] || 0).toFixed(1)}/10
                      </div>
                      <div className="field-info text-[1rem] flex-1">
                        {pitch.description || "Không có thông tin"}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Không có sân
            </Typography>
          )}
        </div>
      </div>
    </div>
  );
};

export default FieldLists;
