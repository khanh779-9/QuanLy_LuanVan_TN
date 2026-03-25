import { faBook, faGavel, faHouse, faListCheck, faPeopleGroup, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import StuLogo from "../../assets/LoginPage/Logo_STU.png";

function Sidebar() {
  return (
    <div className="bg-white w-full h-full flex-col flex">
      <div className="w-full h-20 flex items-center justify-start px-5 border-b border-slate-200 animate-slideInLeft">
        <div className="w-11.25 h-11.25 shrink-0">
          <img src={StuLogo} alt="STU Logo" className="w-full h-full object-contain drop-shadow-sm" />
        </div>
        <div className="ml-3 flex flex-col justify-center">
          <h1 className="font-extrabold text-slate-800 text-[15px] uppercase leading-tight tracking-wide">Managing</h1>
          <h1 className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">Graduation Theses</h1>
        </div>
      </div>
      <div className="mt-10 px-5 w-full animate-slideInLeft">
        <h3 className="px-3 text-[15px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 ">Overview</h3>
        <ul className="">
          <li className="w-full flex items-center text-[14px] font-extrabold">
            <a href="" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-slate-500 bg-transparent hover:bg-blue-50 hover:text-blue-700" >
              <FontAwesomeIcon icon={faHouse} className="pr-3" />Dashbroad
            </a>
          </li>
        </ul>
      </div>
      <div className="mt-10 px-5 w-full animate-slideInLeft">
        <h3 className="px-3 text-[15px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 ">Process</h3>
        <ul className="flex-col space-y-3 font-extrabold text-black w-full">
          <li className="flex items-center w-full">
            <a href="" className=" w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-slate-500 bg-transparent hover:bg-blue-50 hover:text-blue-700" >
              <FontAwesomeIcon icon={faListCheck} className="pr-3" />Topic Management
            </a>
          </li>
          <li className="flex items-center">
            <a href="" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-slate-500 bg-transparent hover:bg-blue-50 hover:text-blue-700" >
              <FontAwesomeIcon icon={faBook} className="pr-3" />Midterm
            </a>
          </li>
          <li className="flex items-center">
            <a href="" className=" w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-slate-500 bg-transparent hover:bg-blue-50 hover:text-blue-700" >
              <FontAwesomeIcon icon={faGavel} />Counter-Argument
            </a>
          </li>
          <li className="flex items-center">
            <a href="" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-slate-500 bg-transparent hover:bg-blue-50 hover:text-blue-700" >
              <FontAwesomeIcon icon={faPeopleGroup} />Council
            </a>
          </li>
        </ul>
      </div>
      <div className="w-full h-20 flex items-center justify-start px-5 border-t border-slate-200 mt-auto">
        <div className="w-1/2"><h2>Lecture</h2></div>
        <div className="w-1/2 flex justify-end items-end">
          <button><FontAwesomeIcon icon={faRightFromBracket} /></button>
        </div>
      </div>
    </div>
  );
}
export default memo(Sidebar);
