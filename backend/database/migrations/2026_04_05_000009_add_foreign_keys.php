<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sinh_vien', function (Blueprint $table) {
            $table->foreign('ma_detai')->references('ma_detai')->on('de_tai')->nullOnDelete();
        });
        Schema::table('de_tai', function (Blueprint $table) {
            $table->foreign('ma_hoidong')->references('ma_hoidong')->on('hoi_dong')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sinhvien', function (Blueprint $table) {
            $table->dropForeign(['maDeTai']);
        });

        Schema::table('detai', function (Blueprint $table) {
            $table->dropForeign(['maHoiDong']);
        });
    }
};
