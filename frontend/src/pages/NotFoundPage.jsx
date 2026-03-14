import { Link, useLocation } from "react-router-dom";

function NotFoundPage() {
  const { pathname } = useLocation();

  return (
    <main className="page">
      <section className="card">
        <h1>Đường dẫn không hợp lệ</h1>
        <p className="intro">
          Trang <strong>{pathname}</strong> không tồn tại trong hệ thống.
        </p>
        <div className="quick-links">
          <Link className="link-button" to="/">
            Quay về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFoundPage;
