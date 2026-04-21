<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;

class SinhVien extends Authenticatable
{
     use HasApiTokens;
    protected $table = 'sinhvien';
    protected $primaryKey = 'mssv';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'mssv', 'hoTen', 'lop', 'email', 'soDienThoai', 'maDeTai',
    ];

    // Ẩn trường mật khẩu
    protected $hidden = [
        'matKhau',
    ];

    public function deTai()
    {
        return $this->belongsTo(DeTai::class, 'maDeTai', 'maDeTai');
    }
}
