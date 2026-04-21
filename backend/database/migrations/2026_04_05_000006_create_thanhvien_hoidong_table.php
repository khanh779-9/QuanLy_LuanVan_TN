<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('thanhvien_hoidong', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('maHoiDong')->nullable();
            $table->string('maGV', 20)->nullable();
            $table->enum('vaiTro', ['ChuTich','ThuKy','UyVien'])->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            
            $table->unique(['maHoiDong', 'maGV']);
            $table->foreign('maHoiDong')->references('maHoiDong')->on('hoidong')->cascadeOnDelete();
            $table->foreign('maGV')->references('maGV')->on('giangvien')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('thanhvien_hoidong');
    }
};
