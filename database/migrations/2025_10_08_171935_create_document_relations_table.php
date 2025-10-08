<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('document_relations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->morphs('related'); // crea related_id y related_type
            $table->string('relation_type')->nullable(); // ej: 'cv', 'license', 'invoice'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_relations');
    }
};
