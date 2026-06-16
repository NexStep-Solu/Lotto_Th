<?php


use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CashDashboardController;
use App\Http\Controllers\LottoController;
use App\Http\Controllers\SgLottoController;

use App\Http\Controllers\CurrencyController;

use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\LocationController;
use App\Http\Middleware\AdminOnly;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('api/lotto')->group(function () {
    Route::get('latest', [LottoController::class, 'latest']);
    Route::get('lotto/{id}', [LottoController::class, 'show']);
    Route::get('list', [LottoController::class, 'list']);
});

Route::prefix('api/lotto/sg')->group(function () {
    Route::get('latest', [SgLottoController::class, 'latest']);
    Route::get('lotto/{id}', [SgLottoController::class, 'show']);
    Route::get('list', [SgLottoController::class, 'list']);
});

Route::get('/offline', function () {
    return view('offline');
});

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
Route::get('auth/google', [SocialLoginController::class, 'redirectToGoogle'])->name('google.login');
Route::get('auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard',  [CashDashboardController::class, 'dashboard'])->name('dashboard');
    Route::middleware([AdminOnly::class])->group(function () {
        Route::get('cash-dashboard', [CashDashboardController::class, 'index'])->name('cash.dashboard');
        Route::get('employee-dashboard', [CashDashboardController::class, 'employeeDashboard'])->name('cash.employeeDashboard');
        Route::post('cash-ledgers/income', [CashDashboardController::class, 'storeIncome'])->name('cash-ledgers.income.store');
        Route::post('cash-ledgers/outcome', [CashDashboardController::class, 'storeOutcome'])->name('cash-ledgers.outcome.store');
        Route::resource('users', UserController::class);
        Route::resource('roles', RoleController::class);
        Route::resource('permissions', PermissionController::class);
        Route::resource('departments', DepartmentController::class);
        Route::resource('branches', BranchController::class);
        Route::resource('locations', LocationController::class);
        Route::resource('currencies', CurrencyController::class);
        Route::get('admin/dashboard', function () {
            return Inertia::render('Admin/Dashboard');
        })->name('admin.dashboard');
    });
});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
