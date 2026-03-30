
export function calcStudentScore(student, scale) {
  const total =
    (parseFloat(student.diemPhanTich) || 0) +
    (parseFloat(student.diemThietKe) || 0) +
    (parseFloat(student.diemHienThuc) || 0) +
    (parseFloat(student.diemBaoCao) || 0);
  const totalMax =
    (parseFloat(scale.maxPhanTich) || 0) +
    (parseFloat(scale.maxThietKe) || 0) +
    (parseFloat(scale.maxHienThuc) || 0) +
    (parseFloat(scale.maxBaoCao) || 0);
  const diemFinal = totalMax > 0 ? ((total / totalMax) * 10).toFixed(1) : 0;
  const diemPercent = totalMax > 0 ? Math.round((total / totalMax) * 100) + "%" : "0%";
  return { ...student, diemFinal, diemPercent };
}


export function recalcAllStudents(students, scale, changedField, changedValue) {
  return students.map((s) => {
    const total =
      (parseFloat(s.diemPhanTich) || 0) +
      (parseFloat(s.diemThietKe) || 0) +
      (parseFloat(s.diemHienThuc) || 0) +
      (parseFloat(s.diemBaoCao) || 0);
    const totalMax =
      (changedField === "maxPhanTich" ? parseFloat(changedValue) : parseFloat(scale.maxPhanTich)) +
      (changedField === "maxThietKe" ? parseFloat(changedValue) : parseFloat(scale.maxThietKe)) +
      (changedField === "maxHienThuc" ? parseFloat(changedValue) : parseFloat(scale.maxHienThuc)) +
      (changedField === "maxBaoCao" ? parseFloat(changedValue) : parseFloat(scale.maxBaoCao));
    const diemFinal = totalMax > 0 ? ((total / totalMax) * 10).toFixed(1) : 0;
    const diemPercent = totalMax > 0 ? Math.round((total / totalMax) * 100) + "%" : "0%";
    return { ...s, diemFinal, diemPercent };
  });
}
