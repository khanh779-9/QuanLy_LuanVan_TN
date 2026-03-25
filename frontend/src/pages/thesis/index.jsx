import { memo } from "react";
import LayoutContainer from "./LayoutContainer";
import LottieImport from "lottie-react";
// import StudentAnimation from "../../assets/LoginPage/student with laptop.json";
import ListThesis from "./ListThesis";



function ThesisManagementPage() {
  const Lottie = LottieImport.default || LottieImport;
  return (
    <LayoutContainer>
      <div className="w-full h-full py-10 space-y-10">
        {/* Header xanh + animation */}
        <div className="relative w-full min-h-32.5 bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl px-10 py-10 shadow-lg shadow-blue-200 flex items-center justify-between overflow-hidden animate-slideTop">
          <div className="relative z-10 flex flex-col gap-1 w-2/3">
            <h1 className="font-extrabold text-white text-[20px]">Thesis Management</h1>
            <span className="font-extralight text-white ">Giai đoạn hiện tại: <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded-md ml-1">5</span></span>
          </div>
          {/* Animation Lottie đã được loại bỏ để tránh crash */}
        </div>
        {/* Box trắng chứa bảng luận văn */}
        <div className="w-full bg-white rounded-2xl flex flex-col py-10 px-10">
          <div className="w-full flex flex-col pb-10 items-center">
            <h1 className="font-extrabold text-[25px] uppercase text-blue-500 animate-slideTop">Danh sách luận văn</h1>
          </div>
          <ListThesis />
        </div>
      </div>
    </LayoutContainer>
  );
}

export default memo(ThesisManagementPage);
