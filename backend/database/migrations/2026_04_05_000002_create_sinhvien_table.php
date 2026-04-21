<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sinh_vien', function (Blueprint $table) {
            $table->string('mssv', 20)->primary();
            $table->string('ho_ten', 100);
            $table->string('lop', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('so_dien_thoai', 15)->nullable();
            $table->unsignedBigInteger('ma_detai')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinhvien');
    }
};
