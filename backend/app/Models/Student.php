<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = ['mssv', 'name', 'class', 'email', 'phone', 'topic_id'];

    public function topic()
    {
        return $this->belongsTo(Topic::class);
    }
    //
}
