import { memo, useRef } from "react";
import Sidebar from "./Sidebar";
import ButtonToTop from "./ButtonToTop";

function LayoutContainer({ children }) {
  const contentRef = useRef(null);
  return (
    <div className="w-full h-screen flex ">
      <div className="w-full  relative min-h-screen flex bg-[url('frontend/src/assets/Homepage/background.jpg')] bg-no-repeat bg-cover">
        <div className="w-1/5 flex "><Sidebar /></div>
        <div ref={contentRef} className="w-4/5 flex px-30 overflow-y-auto flex-col ">{children}</div>
      </div>
      <ButtonToTop targetRef={contentRef} />
    </div>
  );
}
export default memo(LayoutContainer);
