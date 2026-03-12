<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Council extends Model
{
    protected $table = 'hoidong';

    protected $primaryKey = 'maHoiDong';

    public $timestamps = false;

    protected $fillable = ['tenHoiDong', 'diaDiem'];

    public function getRouteKeyName(): string
    {
        return 'maHoiDong';
    }

    public function members()
    {
        return $this->belongsToMany(Teacher::class, 'thanhvienhoidong', 'maHoiDong', 'maGV', 'maHoiDong', 'maGV')
            ->withPivot('vaiTro');
    }

    public function topics()
    {
        return $this->hasMany(Topic::class, 'maHoiDong', 'maHoiDong');
    }
}
