<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giang_vien', function (Blueprint $table) {
            $table->string('ma_gv', 20)->primary();
            $table->string('ten_gv', 100);
            $table->string('email', 100)->unique();
            $table->string('so_dien_thoai', 15)->nullable();
            $table->string('hoc_vi', 50)->nullable();
            $table->string('mat_khau', 255);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giangvien');
    }
};
