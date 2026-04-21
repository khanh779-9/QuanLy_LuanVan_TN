<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('giangvien', function (Blueprint $table) {
            $table->string('maGV', 20)->primary();
            $table->string('tenGV', 100);
            $table->string('email', 100)->unique();
            $table->string('soDienThoai', 15)->nullable();
            $table->string('hocVi', 50)->nullable();
            $table->string('matKhau', 255)->nullable();
            $table->boolean('isAdmin')->default(false);
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('giangvien');
    }
};
