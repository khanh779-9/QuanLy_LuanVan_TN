<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('diem_hoidong', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('ma_detai');
            $table->string('ma_gv', 20);
            $table->decimal('diem_so', 4, 2);
            $table->text('nhan_xet')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->unique(['ma_detai', 'ma_gv']);
            $table->foreign('ma_detai')->references('ma_detai')->on('de_tai')->cascadeOnDelete();
            $table->foreign('ma_gv')->references('ma_gv')->on('giang_vien')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('diem_hoidong');
    }
};
