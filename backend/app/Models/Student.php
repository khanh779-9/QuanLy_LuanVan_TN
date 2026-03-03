<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $table = 'sinhvien';

    protected $primaryKey = 'mssv';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = ['mssv', 'hoTen', 'lop', 'email', 'soDienThoai', 'maDeTai'];

    public function getRouteKeyName(): string
    {
        return 'mssv';
    }

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'maDeTai', 'maDeTai');
    }
    //
}
