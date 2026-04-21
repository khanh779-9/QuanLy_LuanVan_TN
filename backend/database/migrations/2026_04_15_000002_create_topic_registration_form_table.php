<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('topic_registration_form', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('topic_title', 255);
            $table->text('topic_description')->nullable();
            $table->enum('topic_type', ['mot_sinh_vien','hai_sinh_vien']);
            $table->string('student1_id', 20);
            $table->string('student1_name', 255);
            $table->string('student1_class', 50);
            $table->string('student1_email', 255)->nullable();
            $table->string('student2_id', 20)->nullable();
            $table->string('student2_name', 255)->nullable();
            $table->string('student2_class', 50)->nullable();
            $table->string('student2_email', 255)->nullable();
            $table->string('gvhd_code', 20)->nullable();
            $table->string('gvpb_code', 20)->nullable();
            $table->text('note')->nullable();
            $table->enum('status', ['cho_duyet','da_duyet','tu_choi'])->default('cho_duyet');
            $table->string('source', 50)->default('google_form');
            $table->dateTime('registered_at')->useCurrent();
            $table->dateTime('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->string('gvhd_workplace', 255)->nullable();
            $table->foreign('gvhd_code')->references('ma_gv')->on('giang_vien')->nullOnDelete();
        });
    }

    public function down()
    {
        Schema::dropIfExists('topic_registration_form');
    }
};
