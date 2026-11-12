<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\CashLedger;
use App\Models\Employee;
use App\Models\Loan;
use App\Models\LoanSchedule;
use App\Services\CashBalanceService;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashDashboardController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
    ) {}

    /** Admin and manager can view all branches; others see only their branch. */
    protected function canViewAllBranches(): bool
    {
        $user = auth()->user();
        return $user->hasRole('admin') || $user->hasRole('manager');
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('dashboard', [
            'subscription' => $this->subscriptions->snapshot($request->user()),
        ]);
    }
}
