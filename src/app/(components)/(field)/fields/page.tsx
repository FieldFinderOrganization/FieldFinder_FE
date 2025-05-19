import Header from "@/utils/header";
import { Card, Typography } from "@mui/material";
import { FaSearch, FaStar } from "react-icons/fa";
import f from "../../../../../public/images/field3.jpg";
import { CiStar } from "react-icons/ci";

const FieldLists: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 mx-auto px-4 sm:px-8 flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[100px] pb-[100px]">
      <Header />
      <div className="main flex items-start justify-center gap-x-[2rem]  max-w-7xl w-full px-4">
        <div className="search-tabs w-[20%] flex flex-col gap-y-[1rem] max-w-[250px] bg-white rounded-[10px] shadow-md px-[1.5rem] py-[1rem]">
          <div className="input-container relative">
            <FaSearch className="absolute left-[1rem] top-[50%] translate-y-[-50%] text-[#aaa] cursor-pointer" />
            <input
              type="text"
              placeholder="Tìm sân..."
              className="w-full h-[3rem] rounded-[10px] border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 px-[3rem] py-[1rem]"
            />
          </div>
          <div className="areas gap-y-[0.75rem] flex flex-col">
            <div className="w-full h-[3rem] rounded-[10px] border border-gray-600 px-[2rem] py-[1rem] flex items-center justify-between cursor-pointer bg-[#188862] hover:bg-blue-500 transition duration-200 ease-in-out area">
              <Typography variant="body1" color="white" fontWeight={700}>
                Thủ đức
              </Typography>
              <Typography variant="body1" color="white" fontWeight={700}>
                10
              </Typography>
            </div>
            <div className="w-full h-[3rem] rounded-[10px] border border-gray-600 px-[2rem] py-[1rem] flex items-center justify-between cursor-pointer bg-white area">
              <Typography variant="body1" color="black" fontWeight={700}>
                Thủ đức
              </Typography>
              <Typography variant="body1" color="black" fontWeight={700}>
                10
              </Typography>
            </div>
            <div className="w-full h-[3rem] rounded-[10px] border border-gray-600 px-[2rem] py-[1rem] flex items-center justify-between cursor-pointer bg-white area">
              <Typography variant="body1" color="black" fontWeight={700}>
                Thủ đức
              </Typography>
              <Typography variant="body1" color="black" fontWeight={700}>
                10
              </Typography>
            </div>
          </div>
        </div>
        <div className="w-[73%] flex flex-col items-center gap-y-[1rem]">
          <Typography variant="h5" fontWeight={700}>
            Danh sách sân
          </Typography>
          <div className="pitches grid grid-cols-3 gap-y-[2rem] gap-x-[3rem]">
            <Card className="w-[250px] h-[220px] bg-white rounded-[10px] shadow-md flex flex-col items-start gap-y-[0.8rem] cursor-pointer">
              <img
                src={f.src}
                alt="Field"
                className="w-full h-[95px] rounded-t-[10px] object-cover"
              />
              <div className="content flex flex-col gap-y-[0.2rem] ml-[1rem]">
                <div className="ratings flex items-start gap-x-[0.5rem]">
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <CiStar className="text-[0.8rem] text-green-600" />
                </div>
                <Typography fontWeight={700}>Sân Gò Trạch (sân 5)</Typography>
                <Typography>45 Tân Lập</Typography>
                <div className="flex items-center gap-x-[0.5rem]">
                  <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                    8/10
                  </div>
                  <div className="field-info text-[1rem] flex-1">Sân đẹp</div>
                </div>
              </div>
            </Card>
            <Card className="w-[250px] h-[220px] bg-white rounded-[10px] shadow-md flex flex-col items-start gap-y-[0.8rem] cursor-pointer">
              <img
                src={f.src}
                alt="Field"
                className="w-full h-[95px] rounded-t-[10px] object-cover"
              />
              <div className="content flex flex-col gap-y-[0.2rem] ml-[1rem]">
                <div className="ratings flex items-start gap-x-[0.5rem]">
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <CiStar className="text-[0.8rem] text-green-600" />
                </div>
                <Typography fontWeight={700}>Sân Gò Trạch (sân 5)</Typography>
                <Typography>45 Tân Lập</Typography>
                <div className="flex items-center gap-x-[0.5rem]">
                  <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                    8/10
                  </div>
                  <div className="field-info text-[1rem] flex-1">Sân đẹp</div>
                </div>
              </div>
            </Card>
            <Card className="w-[250px] h-[220px] bg-white rounded-[10px] shadow-md flex flex-col items-start gap-y-[0.8rem] cursor-pointer">
              <img
                src={f.src}
                alt="Field"
                className="w-full h-[95px] rounded-t-[10px] object-cover"
              />
              <div className="content flex flex-col gap-y-[0.2rem] ml-[1rem]">
                <div className="ratings flex items-start gap-x-[0.5rem]">
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <CiStar className="text-[0.8rem] text-green-600" />
                </div>
                <Typography fontWeight={700}>Sân Gò Trạch (sân 5)</Typography>
                <Typography>45 Tân Lập</Typography>
                <div className="flex items-center gap-x-[0.5rem]">
                  <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                    8/10
                  </div>
                  <div className="field-info text-[1rem] flex-1">Sân đẹp</div>
                </div>
              </div>
            </Card>
            <Card className="w-[250px] h-[220px] bg-white rounded-[10px] shadow-md flex flex-col items-start gap-y-[0.8rem] cursor-pointer">
              <img
                src={f.src}
                alt="Field"
                className="w-full h-[95px] rounded-t-[10px] object-cover"
              />
              <div className="content flex flex-col gap-y-[0.2rem] ml-[1rem]">
                <div className="ratings flex items-start gap-x-[0.5rem]">
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <FaStar className="text-green-600 text-[0.7rem]" />
                  <CiStar className="text-[0.8rem] text-green-600" />
                </div>
                <Typography fontWeight={700}>Sân Gò Trạch (sân 5)</Typography>
                <Typography>45 Tân Lập</Typography>
                <div className="flex items-center gap-x-[0.5rem]">
                  <div className="bg-blue-600 text-white font-bold rounded-md py-[0.3rem] px-[0.3rem] text-[0.8rem] w-[50px] flex-shrink-0 text-center">
                    8/10
                  </div>
                  <div className="field-info text-[1rem] flex-1">Sân đẹp</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldLists;
