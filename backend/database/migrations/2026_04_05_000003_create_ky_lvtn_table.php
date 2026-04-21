<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giai_doan', function (Blueprint $table) {
            $table->id();
            $table->string('mo_ta', 255)->nullable();
            $table->enum('loai', ['deadline','process','milestone']);
            $table->date('ngay_bat_dau')->nullable();
            $table->date('ngay_ket_thuc')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giai_doan');
    }
};
