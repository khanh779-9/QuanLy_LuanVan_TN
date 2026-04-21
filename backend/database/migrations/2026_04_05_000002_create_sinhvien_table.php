<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sinhvien', function (Blueprint $table) {
            $table->string('mssv', 20)->primary();
            $table->string('hoTen', 100);
            $table->string('lop', 50)->nullable();
            $table->string('email', 100)->nullable();
            $table->string('soDienThoai', 15)->nullable();
            $table->unsignedBigInteger('maDeTai')->nullable();
            $table->string('matKhau', 255)->default('123');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sinhvien');
    }
};
