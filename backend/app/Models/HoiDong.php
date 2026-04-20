<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HoiDong extends Model
{
    protected $table = 'hoidong';
    protected $primaryKey = 'maHoiDong';

    protected $fillable = [
        'tenHoiDong', 'diaDiem',
        'ngayBaoVe', 
    ];
    protected $casts = [
        'ngayBaoVe' => 'datetime', // Tự động format ngày giờ
    ];
    public function thanhVien()
    {
        return $this->hasMany(ThanhVienHoiDong::class, 'maHoiDong', 'maHoiDong');
    }

    public function deTai()
    {
        return $this->hasMany(DeTai::class, 'maHoiDong', 'maHoiDong');
    }

 
}
