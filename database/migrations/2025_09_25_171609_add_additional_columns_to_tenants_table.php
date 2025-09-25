<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('name')->nullable()->after('id');
            $table->string('slug')->unique()->nullable()->after('name');
            $table->text('description')->nullable()->after('slug');
            $table->boolean('is_active')->default(true)->after('description');
            $table->timestamp('trial_ends_at')->nullable()->after('is_active');
            $table->timestamp('suspended_at')->nullable()->after('trial_ends_at');

            $table->index(['is_active']);
            $table->index(['trial_ends_at']);
            $table->index(['suspended_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropIndex(['suspended_at']);
            $table->dropIndex(['trial_ends_at']);
            $table->dropIndex(['is_active']);

            $table->dropColumn([
                'name',
                'slug',
                'description',
                'is_active',
                'trial_ends_at',
                'suspended_at'
            ]);
        });
    }
};
