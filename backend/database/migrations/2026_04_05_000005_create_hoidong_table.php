<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hoi_dong', function (Blueprint $table) {
            $table->bigIncrements('ma_hoidong');
            $table->string('ten_hoidong', 255);
            $table->string('dia_diem', 255)->nullable();
            $table->date('ngay_bao_ve')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hoidong');
    }
};
