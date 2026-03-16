<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\CashLedger;
use App\Models\Employee;
use App\Models\Loan;
use App\Models\LoanSchedule;
use App\Services\CashBalanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashDashboardController extends Controller
{
    /** Admin and manager can view all branches; others see only their branch. */
    protected function canViewAllBranches(): bool
    {
        $user = auth()->user();
        return $user->hasRole('admin') || $user->hasRole('manager');
    }

    public function dashboard(Request $request)
    {
        return Inertia::render('dashboard', []);
    }
}
