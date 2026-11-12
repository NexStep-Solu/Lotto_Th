<?php

use App\Enums\SubscriptionPlan;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('plan', 20)->default(SubscriptionPlan::Basic->value)->after('active');
            $table->timestamp('plan_renews_at')->nullable()->after('plan');
            $table->timestamp('usage_period_start')->nullable()->after('plan_renews_at');
            $table->json('draw_usage')->nullable()->after('usage_period_start');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['plan', 'plan_renews_at', 'usage_period_start', 'draw_usage']);
        });
    }
};
