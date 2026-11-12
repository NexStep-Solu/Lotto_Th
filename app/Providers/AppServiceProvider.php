<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // The public lottery endpoints proxy an upstream scrape. Keep a firm
        // per-IP ceiling so they cannot be used to amplify load or cost.
        RateLimiter::for('lotto-api', function (Request $request) {
            return Limit::perMinute(30)->by($request->ip());
        });
    }
}
