<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    protected $table = 'diem';

    protected $primaryKey = 'maDiem';

    public $timestamps = false;

    protected $fillable = [
        'maDeTai',
        'maGV',
        'loaiDiem',
        'diemSo',
        'nhanXet',
    ];

    public function topic()
    {
        return $this->belongsTo(Topic::class, 'maDeTai', 'maDeTai');
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'maGV', 'maGV');
    }
}
