<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('detai', function (Blueprint $table) {
            $table->id('maDeTai');
            $table->string('tenDeTai', 255)->nullable();
            $table->text('moTa')->nullable();
            $table->string('maGV_HD', 20)->nullable();
            $table->string('maGV_PB', 20)->nullable();
            $table->unsignedBigInteger('maHoiDong')->nullable();

            $table->decimal('diemGiuaKy', 4, 2)->nullable();
            $table->decimal('diemHuongDan', 4, 2)->nullable();
            $table->decimal('diemPhanBien', 4, 2)->nullable();
            $table->decimal('diemHoiDong', 4, 2)->nullable();
            $table->decimal('diemTongKet', 4, 2)->nullable();
            $table->string('diemChu', 5)->nullable();

            $table->enum('trangThaiGiuaKy', ['duoc_lam_tiep','dinh_chi','canh_cao'])->nullable();
            $table->enum('trangThai', ['dat','can_chinh_sua','khong_dat'])->nullable();

            $table->text('nhanXetGiuaKy')->nullable();
            $table->text('nhanXetHuongDan')->nullable();
            $table->text('nhanXetPhanBien')->nullable();

            $table->integer('thuTuTrongHD')->nullable();
            $table->text('ghiChu')->nullable();
            
            $table->json('data_json')->nullable();

            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('maGV_HD')->references('maGV')->on('giangvien')->nullOnDelete();
            $table->foreign('maGV_PB')->references('maGV')->on('giangvien')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detai');
    }
};
