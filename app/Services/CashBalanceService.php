<?php

namespace App\Services;

use App\Models\CashLedger;

class CashBalanceService
{
    public static function branchBalance(int $branchId): float
    {
        $inflow = CashLedger::where('branch_id', $branchId)
            ->where('type', 'inflow')
            ->sum('amount');

        $outflow = CashLedger::where('branch_id', $branchId)
            ->where('type', 'outflow')
            ->sum('amount');

        return $inflow - $outflow;
    }
}
