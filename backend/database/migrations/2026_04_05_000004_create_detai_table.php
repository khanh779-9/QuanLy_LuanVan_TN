<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('de_tai', function (Blueprint $table) {
            $table->bigIncrements('ma_detai');
            $table->string('ten_detai', 255);
            $table->text('mo_ta')->nullable();
            $table->string('ma_gv_hd', 20)->nullable();
            $table->string('ma_gv_pb', 20)->nullable();
            $table->unsignedBigInteger('ma_hoidong')->nullable();

            $table->decimal('diem_giua_ky', 4, 2)->nullable();
            $table->decimal('diem_huong_dan', 4, 2)->nullable();
            $table->decimal('diem_phan_bien', 4, 2)->nullable();
            $table->decimal('diem_hoi_dong', 4, 2)->nullable();
            $table->decimal('diem_tong_ket', 4, 2)->nullable();

            $table->enum('trang_thai_giua_ky', ['duoc_lam_tiep','dinh_chi','canh_cao'])->nullable();
            $table->enum('trang_thai', ['dat','can_chinh_sua','khong_dat'])->nullable();

            $table->text('nhan_xet_giua_ky')->nullable();
            $table->text('nhan_xet_huong_dan')->nullable();
            $table->text('nhan_xet_phan_bien')->nullable();

            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();

            $table->foreign('ma_gv_hd')->references('ma_gv')->on('giang_vien')->nullOnDelete();
            $table->foreign('ma_gv_pb')->references('ma_gv')->on('giang_vien')->nullOnDelete();
            $table->foreign('ma_hoidong')->references('ma_hoidong')->on('hoi_dong')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('detai');
    }
};
