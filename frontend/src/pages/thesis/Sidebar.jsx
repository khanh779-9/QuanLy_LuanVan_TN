import { faBook, faGavel, faHouse, faListCheck, faPeopleGroup, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { memo } from "react";
import { NavLink } from "react-router-dom";
import StuLogo from "/assets/LoginPage/Logo_STU.png";

function Sidebar() {
  return (
    <div className="bg-white w-full h-full flex flex-col rounded-r-3xl shadow-lg border-r border-blue-100 p-0">
      {/* Logo + Title */}
      <div className="w-full h-24 flex items-center gap-3 px-6 border-b border-slate-200">
        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shadow">
          <img src={StuLogo} alt="STU Logo" className="w-10 h-10 object-contain" />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-extrabold text-blue-700 text-[16px] uppercase leading-tight tracking-wide">QL Luận văn</h1>
          <h2 className="font-semibold text-slate-400 text-[12px] uppercase tracking-wider">Graduation Theses</h2>
        </div>
      </div>
      {/* Menu */}
      <div className="mt-8 px-3 w-full">
        <h3 className="px-3 text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">Overview</h3>
        <ul className="space-y-1">
          <li>
            <NavLink to="/thesis/dashbroad" className={({isActive}) =>
              `w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-[15px] transition-all duration-200 ${isActive ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-slate-600 bg-transparent hover:bg-blue-50 hover:text-blue-700'}`
            }>
              <FontAwesomeIcon icon={faHouse} className="pr-2" />Dashbroad
            </NavLink>
          </li>
        </ul>
      </div>
      <div className="mt-6 px-3 w-full">
        <h3 className="px-3 text-[13px] font-bold text-slate-400 uppercase tracking-wider mb-2">Process</h3>
        <ul className="space-y-1">
          <li>
            <NavLink to="/thesis/topic" className={({isActive}) =>
              `w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-[15px] transition-all duration-200 ${isActive ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-slate-600 bg-transparent hover:bg-blue-50 hover:text-blue-700'}`
            }>
              <FontAwesomeIcon icon={faListCheck} className="pr-2" />Topic Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/thesis/midterm" className={({isActive}) =>
              `w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-[15px] transition-all duration-200 ${isActive ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-slate-600 bg-transparent hover:bg-blue-50 hover:text-blue-700'}`
            }>
              <FontAwesomeIcon icon={faBook} className="pr-2" />Midterm
            </NavLink>
          </li>
          <li>
            <NavLink to="/thesis/counter" className={({isActive}) =>
              `w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-[15px] transition-all duration-200 ${isActive ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-slate-600 bg-transparent hover:bg-blue-50 hover:text-blue-700'}`
            }>
              <FontAwesomeIcon icon={faGavel} className="pr-2" />Counter-Argument
            </NavLink>
          </li>
          <li>
            <NavLink to="/thesis/council" className={({isActive}) =>
              `w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-[15px] transition-all duration-200 ${isActive ? 'bg-blue-100 text-blue-700 font-bold shadow' : 'text-slate-600 bg-transparent hover:bg-blue-50 hover:text-blue-700'}`
            }>
              <FontAwesomeIcon icon={faPeopleGroup} className="pr-2" />Council
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Footer */}
      <div className="w-full h-16 flex items-center justify-between px-6 border-t border-slate-200 mt-auto">
        <span className="text-xs text-slate-400">Lecture</span>
        <button className="text-slate-400 hover:text-blue-600 transition"><FontAwesomeIcon icon={faRightFromBracket} /></button>
      </div>
    </div>
  );
}
export default memo(Sidebar);
