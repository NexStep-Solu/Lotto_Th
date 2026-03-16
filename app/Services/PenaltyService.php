<?php

namespace App\Services;

use App\Models\LoanSchedule;
use App\Models\PenaltyRule;
use Carbon\Carbon;

class PenaltyService
{
    public static function calculate(LoanSchedule $schedule): array
    {
        $rule = PenaltyRule::where('is_active', true)->first();
        if (!$rule || $schedule->status === 'paid') {
            return ['days' => 0, 'amount' => 0];
        }

        $today = Carbon::today();
        $due = Carbon::parse($schedule->due_date);

        $overdueDays = $today->diffInDays($due, false);

        if ($overdueDays <= $rule->grace_days) {
            return ['days' => 0, 'amount' => 0];
        }

        $chargeableDays = $overdueDays - $rule->grace_days;
        $baseAmount = $schedule->total_due - $schedule->paid_amount;

        if ($rule->rate_type === 'percentage') {
            $penalty = ($baseAmount * $rule->rate / 100) * $chargeableDays;
        } else {
            $penalty = $rule->rate * $chargeableDays;
        }

        return [
            'days' => $chargeableDays,
            'amount' => round($penalty, 2),
        ];
    }
}
