<?php

namespace App\Services;

use Carbon\Carbon;

class LoanScheduleService
{
    public static function generate(
        float $loanAmount,
        float $interestRate,
        int $tenure,
        string $startDate
    ): array {
        $schedules = [];

        $monthlyPrincipal = $loanAmount / $tenure;
        $monthlyInterest = $loanAmount * ($interestRate / 100);
        $emi = $monthlyPrincipal + $monthlyInterest;

        $balance = $loanAmount;
        $date = Carbon::parse($startDate);

        for ($i = 1; $i <= $tenure; $i++) {
            $balance -= $monthlyPrincipal;

            $schedules[] = [
                'installment' => $i,
                'due_date' => $date->copy()->addMonths($i)->format('Y-m-d'),
                'principal' => round($monthlyPrincipal, 2),
                'interest' => round($monthlyInterest, 2),
                'emi' => round($emi, 2),
                'balance' => round(max($balance, 0), 2),
            ];
        }

        return $schedules;
    }
}
