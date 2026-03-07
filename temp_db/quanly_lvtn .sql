CREATE DATABASE IF NOT EXISTS quanly_lvtn;
USE quanly_lvtn;
-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 28, 2025 at 08:09 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `quanly_lvtn`
--

-- --------------------------------------------------------

--
-- Table structure for table `cauhinh`
--

DROP TABLE IF EXISTS `cauhinh`;
CREATE TABLE IF NOT EXISTS `cauhinh` (
  `id` int NOT NULL,
  `trangThaiChamGK` tinyint DEFAULT '0',
  `giaiDoan` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cauhinh`
--

INSERT INTO `cauhinh` (`id`, `trangThaiChamGK`, `giaiDoan`) VALUES
(1, 1, 5);

-- --------------------------------------------------------

--
-- Table structure for table `detai`
--

DROP TABLE IF EXISTS `detai`;
CREATE TABLE IF NOT EXISTS `detai` (
  `maDeTai` int NOT NULL AUTO_INCREMENT,
  `maMH` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tenMonHoc` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tenDeTai` text COLLATE utf8mb4_general_ci NOT NULL,
  `maGV_HD` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `maGV_PB` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `ghiChu_PB` text COLLATE utf8mb4_general_ci,
  `ghiChu` text COLLATE utf8mb4_general_ci,
  `diemGiuaKy` float DEFAULT NULL,
  `trangThaiGiuaKy` enum('Được làm tiếp','Đình chỉ','Cảnh cáo') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nhanXetGiuaKy` text COLLATE utf8mb4_general_ci,
  `maHoiDong` int DEFAULT NULL,
  `diemPhanBien` float DEFAULT NULL,
  `nhanXetPhanBien` text COLLATE utf8mb4_general_ci,
  `diemHuongDan` float DEFAULT NULL,
  `diemHoiDong` float DEFAULT NULL,
  `nhanXetHoiDong` text COLLATE utf8mb4_general_ci,
  `diemTongKet` float DEFAULT NULL,
  `diemChu` varchar(5) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `trangThaiHoiDong` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'Đạt / Cần chỉnh sửa / Không đạt',
  PRIMARY KEY (`maDeTai`),
  KEY `fk_detai_gvhd` (`maGV_HD`),
  KEY `fk_detai_gvpb` (`maGV_PB`),
  KEY `fk_detai_hoidong` (`maHoiDong`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `detai`
--

INSERT INTO `detai` (`maDeTai`, `maMH`, `tenMonHoc`, `tenDeTai`, `maGV_HD`, `maGV_PB`, `ghiChu_PB`, `ghiChu`, `diemGiuaKy`, `trangThaiGiuaKy`, `nhanXetGiuaKy`, `maHoiDong`, `diemPhanBien`, `nhanXetPhanBien`, `diemHuongDan`, `diemHoiDong`, `nhanXetHoiDong`, `diemTongKet`, `diemChu`, `trangThaiHoiDong`) VALUES
(10, '1', NULL, 'Chưa cập nhật tên đề tài', 'MA5642', 'MA2431', '', NULL, NULL, 'Được làm tiếp', NULL, NULL, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, '2', 'Đồ án / Khóa luận tốt nghiệp', 'Làm web bán áo thời trang', 'MA2431', 'MA3214', '', NULL, 30, 'Đình chỉ', 'adawdaw', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, '3', 'Đồ án / Khóa luận tốt nghiệp', 'Làm quản lý sinh viên', 'MA2431', 'MA5136', '', NULL, 50, 'Được làm tiếp', '', 13, NULL, NULL, 8, 8, '', 6.4, 'C', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `diem`
--

DROP TABLE IF EXISTS `diem`;
CREATE TABLE IF NOT EXISTS `diem` (
  `maDiem` int NOT NULL AUTO_INCREMENT,
  `maDeTai` int NOT NULL,
  `maGV` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `loaiDiem` enum('HuongDan','PhanBien','HoiDong') COLLATE utf8mb4_general_ci NOT NULL,
  `diemSo` float NOT NULL,
  `nhanXet` text COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`maDiem`),
  KEY `fk_diem_detai` (`maDeTai`),
  KEY `fk_diem_giangvien` (`maGV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `giangvien`
--

DROP TABLE IF EXISTS `giangvien`;
CREATE TABLE IF NOT EXISTS `giangvien` (
  `maGV` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `tenGV` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `soDienThoai` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `hocVi` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `matKhau` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '123',
  PRIMARY KEY (`maGV`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `giangvien`
--

INSERT INTO `giangvien` (`maGV`, `tenGV`, `email`, `soDienThoai`, `hocVi`, `matKhau`) VALUES
('MA235', 'Dương Văn Đeo', '1231313@gmail.com', '12313231', '', '123'),
('MA2431', 'Trần Văn Hùng', 'tranvanhung@gmail.com', '0745652454', '', '123'),
('MA243112', 'Trần Thị A', 'dout3232344@gmail.com', '132131312', '', '1234'),
('MA3214', 'Ngô Xuân Bách', 'ngoxuanbach@gmail.com', '1231231313', '', '123'),
('MA5136', 'Đoàn Trình Dục', 'doatrinhduc@gmail.com', '1231312431', '', '123'),
('MA5642', 'Bùi Nhật Bằng', 'buinhatbang@gmail.com', '1231312313', '', '123');

-- --------------------------------------------------------

--
-- Table structure for table `hoidong`
--

DROP TABLE IF EXISTS `hoidong`;
CREATE TABLE IF NOT EXISTS `hoidong` (
  `maHoiDong` int NOT NULL AUTO_INCREMENT,
  `tenHoiDong` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `diaDiem` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`maHoiDong`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hoidong`
--

INSERT INTO `hoidong` (`maHoiDong`, `tenHoiDong`, `diaDiem`) VALUES
(13, '1', 'C.703');

-- --------------------------------------------------------

--
-- Table structure for table `sinhvien`
--

DROP TABLE IF EXISTS `sinhvien`;
CREATE TABLE IF NOT EXISTS `sinhvien` (
  `mssv` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `hoTen` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `lop` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `soDienThoai` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `maDeTai` int DEFAULT NULL,
  PRIMARY KEY (`mssv`),
  KEY `fk_sinhvien_detai` (`maDeTai`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sinhvien`
--

INSERT INTO `sinhvien` (`mssv`, `hoTen`, `lop`, `email`, `soDienThoai`, `maDeTai`) VALUES
('DH51801379', 'Ngô Minh Đạt', 'D18_TH01', 'DH51801379@student.stu.edu.vn', '792170819', NULL),
('DH52000682', 'Lê Tuấn', 'D20_TH03', 'DH52000682@student.stu.edu.vn', '777789336', NULL),
('DH52001024', 'Nguyễn Duy Sơn', 'D20_TH02', 'DH52001024@student.stu.edu.vn', '783887570', NULL),
('DH52001243', 'Lưu Văn Hiếu', 'D20_TH05', 'DH52001243@student.stu.edu.vn', '977833079', NULL),
('DH52001330', 'Phạm Ngọc Đông', 'D20_TH03', 'DH52001330@student.stu.edu.vn', '366468307', NULL),
('DH52001367', 'Lâm Chí Minh', 'D20_TH01', 'DH52001367@student.stu.edu.vn', '924405798', NULL),
('DH52001688', 'Phạm Nhựt Linh', 'D20_TH02', 'DH52001688@student.stu.edu.vn', '794985963', NULL),
('DH52001900', 'Nguyễn Minh Triều', 'D20_TH01', 'DH52001900@student.stu.edu.vn', '899052420', NULL),
('DH52001904', 'Nguyễn Hữu Trường', 'D20_TH01', 'DH52001904@student.stu.edu.vn', '855021202', NULL),
('DH52002302', 'Cao Hoàng Nam', 'D20_TH01', 'DH52002302@student.stu.edu.vn', '909393047', 11),
('DH52002303', 'Lê Chí Cường', 'D20_TH01', 'DH52002303@student.stu.edu.vn', '904446653', NULL),
('DH52002358', 'Vương Tiến Hùng', 'D20_TH05', 'DH52002358@student.stu.edu.vn', '968189572', NULL),
('DH52002723', 'Phạm Ngọc Khoa', 'D20_TH04', 'DH52002723@student.stu.edu.vn', '528051699', NULL),
('DH52003543', 'Nguyễn Công Chi', 'D20_TH05', 'DH52003543@student.stu.edu.vn', '523261143', NULL),
('DH52003563', 'Phan Văn Việt', 'D20_TH03', 'DH52003563@student.stu.edu.vn', '934487805', NULL),
('DH52003835', 'Trần Đình Khoa', 'D20_TH05', 'DH52003835@student.stu.edu.vn', '707035451', NULL),
('DH52003862', 'Trần Hữu Quang', 'D20_TH05', 'DH52003862@student.stu.edu.vn', '919402052', NULL),
('DH52003935', 'Phạm Châu Phú', 'D20_TH04', 'DH52003935@student.stu.edu.vn', '337847385', NULL),
('DH52003995', 'Huỳnh Thanh Phúc', 'D20_TH04', 'DH52003995@student.stu.edu.vn', '348095507', NULL),
('DH52004272', 'Lưu Thị Thanh Thảo', 'D20_TH06', 'DH52004272@student.stu.edu.vn', '329824880', NULL),
('DH52005049', 'Đặng Ngọc Giàu', 'D20_TH09', 'DH52005049@student.stu.edu.vn', '834376555', NULL),
('DH52005068', 'Nguyễn Thanh Danh', 'D20_TH09', 'DH52005068@student.stu.edu.vn', '798621883', NULL),
('DH52005699', 'Nguyễn Hùng Cường', 'D20_TH10', 'DH52005699@student.stu.edu.vn', '932464672', NULL),
('DH52005731', 'Trần Lê Minh Duy', 'D20_TH09', 'DH52005731@student.stu.edu.vn', '838567807', NULL),
('DH52005747', 'Đào Thành Đạt', 'D20_TH06', 'DH52005747@student.stu.edu.vn', '522939018', NULL),
('DH52005770', 'Trịnh Anh Đức', 'D20_TH11', 'DH52005770@student.stu.edu.vn', '582449063', NULL),
('DH52005804', 'Mai Chí Hiệp', 'D20_TH09', 'DH52005804@student.stu.edu.vn', '949619154', NULL),
('DH52005851', 'Nguyễn Tấn Huy', 'D20_TH08', 'DH52005851@student.stu.edu.vn', '919202108', NULL),
('DH52005870', 'Vũ Trung Kiên', 'D20_TH08', 'DH52005870@student.stu.edu.vn', '779182032', NULL),
('DH52005891', 'Phạm Nguyễn Hoàng Khang', 'D20_TH07', 'DH52005891@student.stu.edu.vn', '833485997', NULL),
('DH52006237', 'Nguyễn Trần Vân Uyển', 'D20_TH09', 'DH52006237@student.stu.edu.vn', '963476850', NULL),
('DH52006575', 'Lâm Tuấn Khoa', 'D20_TH09', 'DH52006575@student.stu.edu.vn', '355002372', NULL),
('DH52007089', 'Huỳnh Minh Khoa', 'D20_TH11', 'DH52007089@student.stu.edu.vn', '898175595', NULL),
('DH52007161', 'Phạm Duy Thắng', 'D20_TH11', 'DH52007161@student.stu.edu.vn', '335444058', NULL),
('DH52007186', 'Trần Như Nguyện', 'D20_TH10', 'DH52007186@student.stu.edu.vn', '388065951', NULL),
('DH52100514', 'Trần Quốc Nam', 'D21_TH04', 'DH52100514@student.stu.edu.vn', '2838506194', NULL),
('DH52100776', 'Vũ Trung Nguyên', 'D21_TH09', 'DH52100776@student.stu.edu.vn', '931329585', NULL),
('DH52100937', 'Nguyễn Xuân Long', 'D21_TH02', 'DH52100937@student.stu.edu.vn', '396285403', NULL),
('DH52101402', 'Nguyễn Văn Hoàng Long', 'D21_TH02', 'DH52101402@student.stu.edu.vn', '828599379', NULL),
('DH52101465', 'Quách Thái Hùng', 'D21_TH02', 'DH52101465@student.stu.edu.vn', '947252595', NULL),
('DH52101856', 'Nguyễn Duy Bản', 'D21_TH03', 'DH52101856@student.stu.edu.vn', '342271703', NULL),
('DH52101979', 'Phạm Thị ánh Hồng', 'D21_TH02', 'DH52101979@student.stu.edu.vn', '976747106', NULL),
('DH52103137', 'Phan Tuấn Dũng', 'D21_TH01', 'DH52103137@student.stu.edu.vn', '357716720', NULL),
('DH52103511', 'Phạm Hữu Chí', 'D21_TH01', 'DH52103511@student.stu.edu.vn', '385920397', NULL),
('DH52103682', 'Bùi Minh Phúc', 'D21_TH01', 'DH52103682@student.stu.edu.vn', '359128746', NULL),
('DH52103727', 'Đào Duy Hoàng Vương', 'D21_TH03', 'DH52103727@student.stu.edu.vn', '983621649', NULL),
('DH52104108', 'Nguyễn Đăng Khoa', 'D21_TH02', 'DH52104108@student.stu.edu.vn', '938240431', NULL),
('DH52104298', 'Lê Thị Ly Ly', 'D21_TH08', 'DH52104298@student.stu.edu.vn', '339519874', NULL),
('DH52104582', 'Ngô Duy Tùng', 'D21_TH03', 'DH52104582@student.stu.edu.vn', '946809362', NULL),
('DH52104857', 'Lê Thị Đa Lin', 'D21_TH04', 'DH52104857@student.stu.edu.vn', '374423479', NULL),
('DH52104887', 'Nhữ Quốc Anh', 'D21_TH05', 'DH52104887@student.stu.edu.vn', '856143299', NULL),
('DH52105312', 'Trần Hà Xuân Thịnh', 'D21_TH02', 'DH52105312@student.stu.edu.vn', '349573458', NULL),
('DH52105342', 'Trần Nguyễn Minh Quân', 'D21_TH05', 'DH52105342@student.stu.edu.vn', '388073445', NULL),
('DH52105346', 'Lê Nguyễn Thành Vũ', 'D21_TH02', 'DH52105346@student.stu.edu.vn', '763163435', NULL),
('DH52105659', 'Bạch Đức Phước', 'D21_TH03', 'DH52105659@student.stu.edu.vn', '866088087', 12),
('DH52106130', 'Bùi Phi Hùng', 'D21_TH01', 'DH52106130@student.stu.edu.vn', '394126389', NULL),
('DH52106176', 'Nguyễn Minh Huy', 'D21_TH07', 'DH52106176@student.stu.edu.vn', '933881276', NULL),
('DH52106292', 'Phan Duy Tuấn', 'D21_TH04', 'DH52106292@student.stu.edu.vn', '327261528', NULL),
('DH52106608', 'Đỗ Quang Vinh', 'D21_TH03', 'DH52106608@student.stu.edu.vn', '708738019', NULL),
('DH52107203', 'Nguyễn Ngọc Thiện', 'D21_TH01', 'DH52107203@student.stu.edu.vn', '962419209', NULL),
('DH52107408', 'Trần Minh Tú', 'D21_TH02', 'DH52107408@student.stu.edu.vn', '772911890', NULL),
('DH52107697', 'Đinh Nguyễn Tuấn', 'D21_TH03', 'DH52107697@student.stu.edu.vn', '976588770', NULL),
('DH52107801', 'Nguyễn Thanh Vân', 'D21_TH05', 'DH52107801@student.stu.edu.vn', '349442507', NULL),
('DH52108018', 'Nguyễn Quốc Thắng', 'D21_TH05', 'DH52108018@student.stu.edu.vn', '765688708', NULL),
('DH52108380', 'Đoàn Thị Yến Bình', 'D21_TH06', 'DH52108380@student.stu.edu.vn', '824108001', NULL),
('DH52108402', 'Nguyễn Trung Hiếu', 'D21_TH05', 'DH52108402@student.stu.edu.vn', '326780829', NULL),
('DH52108453', 'Đinh Phạm Phú Khang', 'D21_TH05', 'DH52108453@student.stu.edu.vn', '778715658', NULL),
('DH52108517', 'Hoàng Hữu Lê Chinh', 'D21_TH05', 'DH52108517@student.stu.edu.vn', '898671245', NULL),
('DH52108656', 'Võ Minh Thuận', 'D21_TH06', 'DH52108656@student.stu.edu.vn', '936452676', NULL),
('DH52110534', 'Nguyễn Mậu An', 'D21_TH08', 'DH52110534@student.stu.edu.vn', '343513046', NULL),
('DH52110553', 'Mai Trần Duy Anh', 'D21_TH13', 'DH52110553@student.stu.edu.vn', '947657637', NULL),
('DH52110561', 'Nguyễn Lan Anh', 'D21_TH11', 'DH52110561@student.stu.edu.vn', '329186138', NULL),
('DH52110568', 'Phạm Minh Anh', 'D21_TH05', 'DH52110568@student.stu.edu.vn', '395168006', NULL),
('DH52110581', 'Nguyễn Ngọc Ân', 'D21_TH13', 'DH52110581@student.stu.edu.vn', '921266924', NULL),
('DH52110593', 'Lê Tôn Bảo', 'D21_TH13', 'DH52110593@student.stu.edu.vn', '949965772', NULL),
('DH52110640', 'Hà Thị Mỹ Châu', 'D21_TH05', 'DH52110640@student.stu.edu.vn', '394949891', NULL),
('DH52110677', 'Nguyễn Ngọc Doanh', 'D21_TH09', 'DH52110677@student.stu.edu.vn', '902904122', NULL),
('DH52110693', 'Đỗ Ngọc Anh Duy', 'D21_TH13', 'DH52110693@student.stu.edu.vn', '865006929', NULL),
('DH52110733', 'Nguyễn Sơn Dương', 'D21_TH11', 'DH52110733@student.stu.edu.vn', '826464186', NULL),
('DH52110742', 'Nguyễn Quốc Đại', 'D21_TH14', 'DH52110742@student.stu.edu.vn', '898366249', NULL),
('DH52110793', 'Trịnh Phát Đạt', 'D21_TH08', 'DH52110793@student.stu.edu.vn', '977336644', NULL),
('DH52110800', 'Nguyễn Võ Hoàng Hải Đăng', 'D21_TH14', 'DH52110800@student.stu.edu.vn', '2837713095', NULL),
('DH52110802', 'Trần Ngọc Điền', 'D21_TH14', 'DH52110802@student.stu.edu.vn', '924640701', NULL),
('DH52110812', 'Trương Thanh Đông', 'D21_TH11', 'DH52110812@student.stu.edu.vn', '706766557', NULL),
('DH52110836', 'Nguyễn Hồng Gấm', 'D21_TH06', 'DH52110836@student.stu.edu.vn', '775160497', NULL),
('DH52110857', 'Nguyễn Đăng Hải', 'D21_TH08', 'DH52110857@student.stu.edu.vn', '909523075', NULL),
('DH52110924', 'Trần Nguyễn Minh Hiếu', 'D21_TH13', 'DH52110924@student.stu.edu.vn', '936049080', NULL),
('DH52110935', 'Nguyễn Đình Hòa', 'D21_TH13', 'DH52110935@student.stu.edu.vn', '888254294', NULL),
('DH52110995', 'Đỗ Quang Huy', 'D21_TH09', 'DH52110995@student.stu.edu.vn', '395553134', NULL),
('DH52111030', 'Nguyễn Quốc Huy', 'D21_TH09', 'DH52111030@student.stu.edu.vn', '933705051', NULL),
('DH52111055', 'Trần Đức Huynh', 'D21_TH10', 'DH52111055@student.stu.edu.vn', '866714807', NULL),
('DH52111063', 'Nguyễn Mạnh Hưng', 'D21_TH11', 'DH52111063@student.stu.edu.vn', '328707978', NULL),
('DH52111067', 'Trần Minh Hưng', 'D21_TH11', 'DH52111067@student.stu.edu.vn', '932078352', NULL),
('DH52111083', 'Trần Mai Huy Khải', 'D21_TH09', 'DH52111083@student.stu.edu.vn', '582079957', NULL),
('DH52111085', 'Trương Minh Khải', 'D21_TH08', 'DH52111085@student.stu.edu.vn', '835359010', NULL),
('DH52111086', 'Dương Trí Khang', 'D21_TH08', 'DH52111086@student.stu.edu.vn', '836169654', 10),
('DH52111112', 'Đỗ Quốc Khánh', 'D21_TH10', 'DH52111112@student.stu.edu.vn', '983062644', NULL),
('DH52111115', 'Mai Lâm Quang Khánh', 'D21_TH10', 'DH52111115@student.stu.edu.vn', '707347324', NULL),
('DH52111171', 'Lâm Tuấn Kiệt', 'D21_TH10', 'DH52111171@student.stu.edu.vn', '941693505', 12),
('DH52111174', 'Ngô Tuấn Kiệt', 'D21_TH08', 'DH52111174@student.stu.edu.vn', '849929007', NULL),
('DH52111204', 'Trương Văn Liêu', 'D21_TH08', 'DH52111204@student.stu.edu.vn', '393726628', NULL),
('DH52111212', 'Nguyễn Hoàng Linh', 'D21_TH11', 'DH52111212@student.stu.edu.vn', '941412077', NULL),
('DH52111224', 'Giang Nhật Long', 'D21_TH13', 'DH52111224@student.stu.edu.vn', '856639637', 10),
('DH52111245', 'Võ Thành Long', 'D21_TH10', 'DH52111245@student.stu.edu.vn', '937369772', NULL),
('DH52111258', 'Trần Tấn Lộc', 'D21_TH10', 'DH52111258@student.stu.edu.vn', '332345957', NULL),
('DH52111293', 'Ong Văn Mến', 'D21_TH12', 'DH52111293@student.stu.edu.vn', '933331843', NULL),
('DH52111358', 'Đồng Văn Nghĩa', 'D21_TH08', 'DH52111358@student.stu.edu.vn', '382149204', NULL),
('DH52111401', 'Lê Quang Nhân', 'D21_TH08', 'DH52111401@student.stu.edu.vn', '393638193', NULL),
('DH52111411', 'Trần Trọng Nhân', 'D21_TH08', 'DH52111411@student.stu.edu.vn', '2723867856', NULL),
('DH52111439', 'Huỳnh Tấn Nhớ', 'D21_TH13', 'DH52111439@student.stu.edu.vn', '977979791', NULL),
('DH52111441', 'Nguyễn Thị Nhung', 'D21_TH09', 'DH52111441@student.stu.edu.vn', '359439628', NULL),
('DH52111482', 'Võ Văn Phát', 'D21_TH09', 'DH52111482@student.stu.edu.vn', '937689655', NULL),
('DH52111486', 'Nguyễn Tấn Phi', 'D21_TH09', 'DH52111486@student.stu.edu.vn', '703760626', NULL),
('DH52111491', 'Nguyễn Chí Phong', 'D21_TH10', 'DH52111491@student.stu.edu.vn', '903073250', NULL),
('DH52111509', 'Nguyễn Thành Tỷ Phú', 'D21_TH10', 'DH52111509@student.stu.edu.vn', '767392039', NULL),
('DH52111529', 'Lê Trần Trọng Phúc', 'D21_TH10', 'DH52111529@student.stu.edu.vn', '946129499', NULL),
('DH52111531', 'Lưu Hoàng Phúc', 'D21_TH13', 'DH52111531@student.stu.edu.vn', '396895104', NULL),
('DH52111560', 'Võ Hoàng Phúc', 'D21_TH08', 'DH52111560@student.stu.edu.vn', '767764470', NULL),
('DH52111579', 'Nguyễn Việt Phương', 'D21_TH09', 'DH52111579@student.stu.edu.vn', '978699529', NULL),
('DH52111612', 'Trần Nguyễn Hoàng Quân', 'D21_TH10', 'DH52111612@student.stu.edu.vn', '911341117', NULL),
('DH52111615', 'Võ Minh Quân', 'D21_TH13', 'DH52111615@student.stu.edu.vn', '854381067', NULL),
('DH52111637', 'Nguyễn Đăng Quyền', 'D21_TH10', 'DH52111637@student.stu.edu.vn', '815804376', NULL),
('DH52111681', 'Lê Anh Tài', 'D21_TH10', 'DH52111681@student.stu.edu.vn', '967788246', NULL),
('DH52111695', 'Nguyễn Văn Tài', 'D21_TH13', 'DH52111695@student.stu.edu.vn', '985141631', NULL),
('DH52111700', 'Thái Tấn Tài', 'D21_TH09', 'DH52111700@student.stu.edu.vn', '353004163', NULL),
('DH52111720', 'Nguyễn Công Tấn', 'D21_TH10', 'DH52111720@student.stu.edu.vn', NULL, NULL),
('DH52111756', 'Lê Minh Thảo', 'D21_TH13', 'DH52111756@student.stu.edu.vn', '522731750', NULL),
('DH52111794', 'Nguyễn Chí Thiện', 'D21_TH13', 'DH52111794@student.stu.edu.vn', '979286060', NULL),
('DH52111823', 'Võ Thị Tho', 'D21_TH10', 'DH52111823@student.stu.edu.vn', '969747148', NULL),
('DH52111833', 'Lê Nguyễn Minh Thông', 'D21_TH08', 'DH52111833@student.stu.edu.vn', '769630210', NULL),
('DH52111845', 'Lâm Gia Thuận', 'D21_TH13', 'DH52111845@student.stu.edu.vn', '931548545', NULL),
('DH52111847', 'Lương Hiếu Thuận', 'D21_TH08', 'DH52111847@student.stu.edu.vn', '965629532', NULL),
('DH52111863', 'Nguyễn Thị Minh Thư', 'D21_TH10', 'DH52111863@student.stu.edu.vn', '97473170', NULL),
('DH52111881', 'Trần Thủy Tiên', 'D21_TH08', 'DH52111881@student.stu.edu.vn', '327458490', NULL),
('DH52111923', 'Đỗ Minh Trí', 'D21_TH10', 'DH52111923@student.stu.edu.vn', '704651788', NULL),
('DH52111976', 'Nguyễn Minh Trường', 'D21_TH13', 'DH52111976@student.stu.edu.vn', '939024432', NULL),
('DH52112002', 'Lâm Đình Tuấn', 'D21_TH14', 'DH52112002@student.stu.edu.vn', '906673427', NULL),
('DH52112019', 'Nguyễn Ngọc Thanh Tuệ', 'D21_TH08', 'DH52112019@student.stu.edu.vn', '907355548', NULL),
('DH52112079', 'Nguyễn Đình Vinh', 'D21_TH14', 'DH52112079@student.stu.edu.vn', '383731640', NULL),
('DH52112118', 'Trần Hoàng Vương', 'D21_TH13', 'DH52112118@student.stu.edu.vn', '987038840', NULL),
('DH52112127', 'Lương Triều Vỹ', 'D21_TH08', 'DH52112127@student.stu.edu.vn', NULL, NULL),
('DH52112786', 'Đinh Quang Thịnh', 'D21_TH10', 'DH52112786@student.stu.edu.vn', '931487603', NULL),
('DH52112805', 'Võ Trọng Nghĩa', 'D21_TH12', 'DH52112805@student.stu.edu.vn', NULL, NULL),
('DH52112809', 'Mai Hoàng An', 'D21_TH12', 'DH52112809@student.stu.edu.vn', '972285275', NULL),
('DH52112944', 'Lê Đoàn Anh Quân', 'D21_TH11', 'DH52112944@student.stu.edu.vn', '866603591', NULL),
('DH52113016', 'Huỳnh Quốc Duy', 'D21_TH14', 'DH52113016@student.stu.edu.vn', '362949286', 11),
('DH52113047', 'Phan Đức Thắng', 'D21_TH14', 'DH52113047@student.stu.edu.vn', '949985490', NULL),
('DH52113134', 'Mai Quang Vinh', 'D21_TH12', 'DH52113134@student.stu.edu.vn', '523756478', NULL),
('DH52113292', 'Lê Minh Kiệt', 'D21_TH08', 'DH52113292@student.stu.edu.vn', '937733385', NULL),
('DH52113345', 'Lữ Mai Phương', 'D21_TH08', 'DH52113345@student.stu.edu.vn', '833063875', NULL),
('DH52113526', 'Trần Thái Duy', 'D21_TH11', 'DH52113526@student.stu.edu.vn', '935183461', NULL),
('DH52113777', 'Huỳnh Xuân Thọ', 'D21_TH12', 'DH52113777@student.stu.edu.vn', NULL, NULL),
('LT52200006', 'Trần Minh Nghĩa', 'L22_TH01', 'LT52200006@student.stu.edu.vn', '908655034', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `thanhvienhoidong`
--

DROP TABLE IF EXISTS `thanhvienhoidong`;
CREATE TABLE IF NOT EXISTS `thanhvienhoidong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `maHoiDong` int NOT NULL,
  `maGV` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `vaiTro` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `maHoiDong` (`maHoiDong`),
  KEY `maGV` (`maGV`)
) ENGINE=MyISAM AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thanhvienhoidong`
--

INSERT INTO `thanhvienhoidong` (`id`, `maHoiDong`, `maGV`, `vaiTro`) VALUES
(51, 13, 'MA235', 'UyVien'),
(50, 13, 'MA2431', 'ThuKy'),
(49, 13, 'MA3214', 'ThuKy'),
(48, 13, 'MA5642', 'ChuTich');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `detai`
--
ALTER TABLE `detai`
  ADD CONSTRAINT `fk_detai_gvhd` FOREIGN KEY (`maGV_HD`) REFERENCES `giangvien` (`maGV`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detai_gvpb` FOREIGN KEY (`maGV_PB`) REFERENCES `giangvien` (`maGV`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detai_hoidong` FOREIGN KEY (`maHoiDong`) REFERENCES `hoidong` (`maHoiDong`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `diem`
--
ALTER TABLE `diem`
  ADD CONSTRAINT `fk_diem_detai` FOREIGN KEY (`maDeTai`) REFERENCES `detai` (`maDeTai`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_diem_giangvien` FOREIGN KEY (`maGV`) REFERENCES `giangvien` (`maGV`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD CONSTRAINT `fk_sinhvien_detai` FOREIGN KEY (`maDeTai`) REFERENCES `detai` (`maDeTai`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
