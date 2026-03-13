import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="page">
      <section className="card">
        <h1>Frontend Playground</h1>
        <p className="intro">
            Trang này chỉ code tạm thời
            Mấy bạn bên FE tinh chỉnh lại UI sau nha
        </p>
        <div className="quick-links">
          <Link className="link-button" to="/users">
            Mở trang users
          </Link>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
