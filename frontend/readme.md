# Frontend

Front-ENd hiện tại, leader t chỉ mới tạo giao diện cho bảng Users (chỉ để thầy và nhóm test)

``[FE_URL]\users``

Nhóm FE tiếp tục làm giao diện quản lý theo đề tài và sự phân công sau đó

Front-end đc thiết kế ở đường link riêng, nên phải giao tiếp với API theo 1 đường link khác của Backend mới có thể khai thác đc
# Frontend

Frontend da duoc tach theo huong doc lap de test tung trang va de mo rong sau nay.

## Route hien co

- [FE_URL]/: trang vao test module.
- [FE_URL]/users: trang quan ly users (CRUD day du).

## Cau truc de mo rong

- src/App.jsx: khai bao router tong.
- src/pages/users/UsersPage.jsx: giao dien + logic trang users.
- src/services/usersApi.js: toan bo goi API cho users.

Sau nay chi can them page moi trong src/pages va service tuong ung trong src/services, sau do dang ky route tai src/App.jsx.
