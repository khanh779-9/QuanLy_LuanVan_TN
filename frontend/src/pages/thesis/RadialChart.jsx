import { useEffect, useRef } from "react";
import ApexCharts from "apexcharts";

export default function RadialChart() {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = new ApexCharts(chartRef.current, {
      series: [12, 23, 64],
      colors: ["#2563EB", "#F59E0B", "#10B981"],
      chart: { height: 280, width: "100%", type: "radialBar", sparkline: { enabled: true } },
      plotOptions: { radialBar: { track: { background: "#E5E7EB" }, dataLabels: { show: true }, hollow: { margin: 0, size: "40%" } } },
      grid: { show: false, strokeDashArray: 4, padding: { left: 2, right: 2 } },
      labels: ["Website", "Mobile", "Window"],
      legend: { show: true, position: "bottom", fontFamily: "Inter, sans-serif" },
      tooltip: { enabled: true, x: { show: true } },
      yaxis: { show: true, labels: { formatter: (value) => `${value}%` } },
    });
    chart.render();
    return () => { chart.destroy(); };
  }, []);
  return <div ref={chartRef} className="w-full h-85 text-white font-extrabold" />;
}
