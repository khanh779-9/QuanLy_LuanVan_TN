import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="page">
      <section className="card">
        <h1>Frontend Playground</h1>
        <p className="intro">
            Trang này chỉ code tạm thời
            Mấy bạn bên FE bổ sung giao diện để phù hợp với đề tài nha
        </p>
        <div className="quick-links">
          <Link className="link-button" to="/users">
            Mở trang users (chỉ test)
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
