<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $table = 'giangvien';

    protected $primaryKey = 'maGV';

    public $incrementing = false;

    protected $keyType = 'string';

    public $timestamps = false;

    protected $fillable = [
        'maGV',
        'tenGV',
        'email',
        'soDienThoai',
        'hocVi',
        'matKhau',
    ];

    protected $hidden = [
        'matKhau',
        'remember_token',
    ];

    public function getRouteKeyName(): string
    {
        return 'maGV';
    }

    public function getAuthPassword(): string
    {
        return $this->matKhau;
    }

    public function topics()
    {
        return $this->hasMany(Topic::class, 'maGV_HD', 'maGV');
    }

    public function reviewTopics()
    {
        return $this->hasMany(Topic::class, 'maGV_PB', 'maGV');
    }

    public function councils()
    {
        return $this->belongsToMany(Council::class, 'thanhvienhoidong', 'maGV', 'maHoiDong', 'maGV', 'maHoiDong')
            ->withPivot('vaiTro');
    }
}
