<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hoidong', function (Blueprint $table) {
            $table->bigIncrements('maHoiDong');
            $table->string('tenHoiDong', 255)->nullable(false);
            $table->string('diaDiem', 255)->nullable();
            $table->dateTime('ngayBaoVe')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hoidong');
    }
};
