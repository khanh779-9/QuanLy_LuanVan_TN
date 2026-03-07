<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Council;
use App\Models\Student;

class Topic extends Model
{
    protected $table = 'detai';

    protected $primaryKey = 'maDeTai';

    public $timestamps = false;

    protected $fillable = [
        'maMH',
        'tenMonHoc',
        'tenDeTai',
        'maGV_HD',
        'maGV_PB',
        'maHoiDong',
        'ghiChu',
        'ghiChu_PB',
        'diemGiuaKy',
        'trangThaiGiuaKy',
        'nhanXetGiuaKy',
        'diemHuongDan',
        'diemPhanBien',
        'nhanXetPhanBien',
        'diemHoiDong',
        'nhanXetHoiDong',
        'diemTongKet',
        'diemChu',
        'trangThaiHoiDong'
    ];

    protected $guarded = [];

    public function getRouteKeyName(): string
    {
        return 'maDeTai';
    }

    public function scopeForUser($query, $user)
    {
        return $query;
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'maGV_HD', 'maGV');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'maGV_PB', 'maGV');
    }

    public function council()
    {
        return $this->belongsTo(Council::class, 'maHoiDong', 'maHoiDong');
    }

    public function students()
    {
        return $this->hasMany(Student::class, 'maDeTai', 'maDeTai');
    }
}
