import LayoutContainer from "./LayoutContainer";

export default function CounterArgument() {
  return (
    <LayoutContainer>
      <div className="p-10">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">Counter-Argument</h1>
        <div className="bg-white rounded-xl shadow p-6">Nội dung phản biện sẽ đặt ở đây.</div>
      </div>
    </LayoutContainer>
  );
}
