<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouncilMember extends Model
{
    protected $table = 'thanhvienhoidong';

    public $timestamps = false;

    protected $fillable = ['maHoiDong', 'maGV', 'vaiTro'];

    //
}
