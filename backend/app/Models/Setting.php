<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $table = 'cauhinh';

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = ['id', 'trangThaiChamGK', 'giaiDoan'];
    //
}
