<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Council;
use App\Models\Student;

class Topic extends Model
{
    protected $fillable = [
        'code',
        'subject_name',
        'name',
        'lecturer_id',
        'reviewer_id',
        'council_id',
        'description',
        'reviewer_note',
        'midterm_score',
        'midterm_status',
        'midterm_comment',
        'advisor_score',
        'defense_score',
        'defense_comment',
        'council_score',
        'council_comment',
        'final_score',
        'letter_grade',
        'council_status'
    ];

    protected $guarded = [];

    public function scopeForUser($query, $user)
    {
        if ($user->role !== 'admin') {
            return $query->where(function ($q) use ($user) {
                $q->where('lecturer_id', $user->id)
                    ->orWhere('reviewer_id', $user->id);
            });
        }
        return $query;
    }

    public function lecturer()
    {
        return $this->belongsTo(User::class, 'lecturer_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function council()
    {
        return $this->belongsTo(Council::class);
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }
}
