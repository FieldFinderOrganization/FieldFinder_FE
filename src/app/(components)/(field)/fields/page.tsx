import Header from "@/utils/header";
import { Typography } from "@mui/material";

const FieldLists: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 mx-auto flex flex-col space-y-[1rem] sm:space-y-[2rem] pt-[80px] pb-[100px]">
      <Header />
      <div className="main flex items-start justify-center gap-x-[2rem]">
        <Typography>ALOOO</Typography>
      </div>
    </div>
  );
};

export default FieldLists;
