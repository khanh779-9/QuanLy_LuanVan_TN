import { memo, useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";

function ButtonToTop({ targetRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const scrollTarget = targetRef?.current || window;
    const toggleVisible = () => {
      const scrollTop = targetRef?.current ? targetRef.current.scrollTop : window.scrollY;
      setVisible(scrollTop > 200);
    };
    scrollTarget.addEventListener("scroll", toggleVisible);
    return () => {
      scrollTarget.removeEventListener("scroll", toggleVisible);
    };
  }, [targetRef]);

  const scrollToTop = () => {
    if (targetRef?.current) {
      targetRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      onClick={scrollToTop}
      className={`fixed bottom-10 right-5 z-50 w-16 h-16 flex items-center justify-center group cursor-pointer transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="absolute animate-spinSlow w-full h-full border-2 border-white border-dashed rounded-full hover:border-blue-500 transition ease-in-out duration-500"></div>
      <button className="w-13 h-13 bg-white rounded-full transition ease-in-out duration-500 group-hover:bg-blue-500">
        <FontAwesomeIcon icon={faArrowUp} className="text-blue-500 group-hover:text-white transition ease-in-out duration-500" />
      </button>
    </div>
  );
}
export default memo(ButtonToTop);
