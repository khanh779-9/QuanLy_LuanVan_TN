import { memo } from "react";
import LayoutContainer from "./LayoutContainer";
import LottieImport from "lottie-react";
// import StudentAnimation from "assets/LoginPage/student with laptop.json";
import ChartProgress from "./ChartProgress";
import Blog from "./Blog";

const Lottie = LottieImport.default || LottieImport;

const timeLineData = [
    { id: 1, date: "January 09th, 2025", title: "Lecturer Assignment", description: "Assigned thesis supervision tasks to lecturers." },
    { id: 2, date: "March 14th, 2025", title: "Midterm Review", description: "Students submit midterm reports for evaluation." },
    { id: 3, date: "September 26th, 2025", title: "Defense Council", description: "Final thesis defense schedule has been published." },
];

function Dashbroad() {
    return (
        <LayoutContainer>
            <div className="w-full h-full  py-10 space-y-10">
                <div className="relative w-full min-h-32.5 bg-linear-to-r from-blue-700 to-blue-500 rounded-2xl px-10 py-10 shadow-lg shadow-blue-200 flex items-center justify-between overflow-hidden animate-slideTop">
                    <div className="relative z-10 flex flex-col gap-1 w-2/3">
                        <h1 className="font-extrabold text-white text-[20px] up">Hello, Tran Van Hung</h1>
                        <span className="font-extralight text-white ">Giai đoạn hiện tại: <span className="text-white font-bold bg-white/20 px-2 py-0.5 rounded-md ml-1">5</span></span>
                    </div>
                    {/* Animation Lottie đã được loại bỏ để tránh crash */}
                </div>
                <div className="w-full  bg-white rounded-2xl flex flex-col py-10 px-10">
                    <div className="w-full flex flex-col pb-10 items-center">
                        <h1 className="font-extrabold text-[25px] uppercase text-blue-500 animate-slideTop">Lecturer's work area</h1>
                    </div>
                    <div className="flex">
                        <div className="w-1/2 flex items-center justify-center animate-slideTop"><ChartProgress /></div>
                        <div className="w-1/2 flex items-center right-0 animate-slideTop"><Blog /></div>
                    </div>
                    <div className="w-full pt-20 flex items-center justify-center">
                        <h1 className="font-extrabold text-[25px] uppercase text-blue-500">Work Timeline</h1>
                    </div>
                    <div className="p-10  flex flex-col items-start justify-start">
                        <ol className="relative border-s-2 border-slate-300 space-y-8 ml-4 w-full">
                            {timeLineData.map((item) => (
                                <li className="relative ms-6 w-full" key={item.id}>
                                    <span className="absolute -inset-s-10 flex items-center justify-center w-8 h-8 bg-brand-softer rounded-full ring-3 ring-blue-500 shadow-sm bg-white">
                                        <svg className="w-3 h-3 text-fg-brand-strong text-blue-500 font-extrabold" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 10h16m-8-3V4M7 7V4m10 3V4M5 20h14a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1Zm3-7h.01v.01H8V13Zm4 0h.01v.01H12V13Zm4 0h.01v.01H16V13Zm-8 4h.01v.01H8V17Zm4 0h.01v.01H12V17Zm4 0h.01v.01H16V17Z"/></svg>
                                    </span>
                                    <div className="mt-1 ml-2">
                                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
                                            <time className="inline-block mb-4 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">{item.date}</time>
                                            <h3 className="text-lg font-semibold text-heading my-2">{item.title}</h3>
                                            <p className="text-body mb-4">{item.description}</p>
                                            <a href="#" className="inline-flex items-center text-white font-extrabold -brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none bg-blue-500 rounded-xl">Read more<svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg></a>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </LayoutContainer>
    );
}
export default memo(Dashbroad);
