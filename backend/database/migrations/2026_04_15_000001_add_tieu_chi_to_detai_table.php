<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('detai', function (Blueprint $table) {
            $table->json('tieuChiHD')->nullable()->after('nhanXetHuongDan');
            $table->json('tieuChiPB')->nullable()->after('nhanXetPhanBien');
            $table->json('tieuChiGK')->nullable()->after('nhanXetGiuaKy');
        });
    }

    public function down(): void
    {
        Schema::table('detai', function (Blueprint $table) {
            $table->dropColumn(['tieuChiHD', 'tieuChiPB', 'tieuChiGK']);
        });
    }
};
