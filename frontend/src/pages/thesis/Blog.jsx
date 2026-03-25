import { memo } from "react";

function Blog() {
    return (
        <div className="w-full flex flex-col space-y-9 items-center justify-center">
            <div className="bg-linear-to-br from-white to-slate-50 block max-w-sm p-5 border-0 rounded-2xl shadow-2xl">
                <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">Latest Update</span>
                <h5 className="mb-3 text-xl font-semibold tracking-tight text-heading leading-8">Noteworthy technology acquisitions 2021</h5>
                <p className="text-[15px] mb-6">Here are the biggest technology acquisitions of 2025 so far, in reverse chronological order.</p>
                <a href="#" className="inline-flex items-center text-white font-extrabold -brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none bg-blue-500 rounded-xl">Read more<svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg></a>
            </div>
            <div className="bg-linear-to-br from-white to-slate-50 block max-w-sm p-5 border-0 rounded-2xl shadow-2xl">
                <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">Latest Update</span>
                <h5 className="mb-3 text-xl font-semibold tracking-tight text-heading leading-8">Noteworthy technology acquisitions 2021</h5>
                <p className="text-[15px] mb-6">Here are the biggest technology acquisitions of 2025 so far, in reverse chronological order.</p>
                <a href="#" className="inline-flex items-center text-white font-extrabold -brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none bg-blue-500 rounded-xl">Read more<svg className="w-4 h-4 ms-1.5 rtl:rotate-180 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/></svg></a>
            </div>
        </div>
    );
}
export default memo(Blog);
