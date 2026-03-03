<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Council extends Model
{
    protected $fillable = ['name', 'location'];

    public function members()
    {
        return $this->belongsToMany(User::class, 'council_members')->withPivot('role');
    }

    public function topics()
    {
        return $this->hasMany(Topic::class);
    }
}
