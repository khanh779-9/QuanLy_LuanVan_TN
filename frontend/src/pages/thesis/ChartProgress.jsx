import { memo } from "react";
import RadialChart from "./RadialChart";

function ChartProgress() {
    return (
        <div className="max-w-sm w-full bg-neutral-primary-soft rounded-base shadow-2xl p-4 md:p-6 rounded-2xl">
            <div className="flex justify-between mb-4 md:mb-6">
                <div className="flex items-center">
                    <div className="flex justify-center items-center">
                        <h5 className="text-xl font-semibold text-heading me-1">Project Statistics</h5>
                        {/* ...icon and popover omitted for brevity... */}
                    </div>
                </div>
            </div>
            <div className="bg-neutral-secondary-medium  p-3 rounded-2xl mb-3">
                <div className="grid grid-cols-3 gap-3 mb-3 ">
                    <dl className="bg-blue-500   text-white  font-extrabold rounded-base flex flex-col items-center justify-center h-19.5 rounded-xl">
                        <dt className="w-8 h-8 rounded-full bg-brand-soft text-fg-brand-strong text-sm font-medium flex items-center justify-center mb-1">12</dt>
                        <dd className="text-fg-brand text-sm font-medium">Website</dd>
                    </dl>
                    <dl className="bg-orange-500 text-white  text-fg-warning rounded-base flex flex-col items-center justify-center h-19.5 rounded-xl">
                        <dt className="w-8 h-8 rounded-full bg-warning-medium text-fg-warning text-sm font-medium flex items-center justify-center mb-1">23</dt>
                        <dd className="text-fg-warning text-sm font-medium">Mobile</dd>
                    </dl>
                    <dl className="bg-emerald-500 text-white font-extrabold  text-fg-success-strong rounded-base flex flex-col items-center justify-center h-19.5 rounded-xl">
                        <dt className="w-8 h-8 rounded-full bg-success-medium text-fg-success-strong text-sm font-medium flex items-center justify-center mb-1">64</dt>
                        <dd className="text-fg-success-strong text-sm font-medium">Window</dd>
                    </dl>
                </div>
                {/* ...show more details omitted for brevity... */}
            </div>
            <div className="w-full h-fit flex flex-col pt-2">
                <RadialChart />
            </div>
        </div>
    );
}
export default memo(ChartProgress);
