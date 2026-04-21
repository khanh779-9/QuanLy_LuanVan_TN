<?php

namespace Database\Seeders;

use App\Models\GiangVien;
use App\Models\KyLvtn;
use App\Models\SinhVien;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        GiangVien::create([
            'maGV' => 'GV001',
            'tenGV' => 'Nguyen Van Admin',
            'email' => 'admin@stu.edu.vn',
            'hocVi' => 'ThS',
            'matKhau' => Hash::make('123456'),
        ]);

        GiangVien::create([
            'maGV' => 'GV002',
            'tenGV' => 'Tran Thi Binh',
            'email' => 'binh@stu.edu.vn',
            'hocVi' => 'TS',
            'matKhau' => Hash::make('123456'),
        ]);

        GiangVien::create([
            'maGV' => 'GV003',
            'tenGV' => 'Le Van Cuong',
            'email' => 'cuong@stu.edu.vn',
            'hocVi' => 'ThS',
            'matKhau' => Hash::make('123456'),
        ]);

        GiangVien::create([
            'maGV' => 'GV004',
            'tenGV' => 'Pham Minh Duc',
            'email' => 'duc@stu.edu.vn',
            'hocVi' => 'ThS',
            'matKhau' => Hash::make('123456'),
        ]);

        $svList = [
            ['mssv' => 'DH52100001', 'hoTen' => 'Hoang Van Em', 'lop' => 'D21_TH01', 'email' => 'em@student.stu.edu.vn'],
            ['mssv' => 'DH52100002', 'hoTen' => 'Vo Thi Phuong', 'lop' => 'D21_TH01', 'email' => 'phuong@student.stu.edu.vn'],
            ['mssv' => 'DH52100003', 'hoTen' => 'Bui Quoc Gia', 'lop' => 'D21_TH02', 'email' => 'gia@student.stu.edu.vn'],
            ['mssv' => 'DH52100004', 'hoTen' => 'Dang Ngoc Han', 'lop' => 'D21_TH02', 'email' => 'han@student.stu.edu.vn'],
            ['mssv' => 'DH52100005', 'hoTen' => 'Ly Van Ich', 'lop' => 'D21_TH03', 'email' => 'ich@student.stu.edu.vn'],
        ];

        foreach ($svList as $sv) {
            SinhVien::create([
                'mssv' => $sv['mssv'],
                'hoTen' => $sv['hoTen'],
                'lop' => $sv['lop'],
                'email' => $sv['email'],
            ]);
        }
    }
}
