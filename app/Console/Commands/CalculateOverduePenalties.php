<?php

namespace App\Console\Commands;

use App\Models\LoanSchedule;
use App\Services\PenaltyService;
use Illuminate\Console\Command;
use Illuminate\Console\Scheduling\Schedule;

class CalculateOverduePenalties extends Command
{
    /**
     * The name and signature of the console command.
     *
     * 
     * @var string
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('loans:penalties')->daily();
    }
    protected $signature = 'loans:penalties';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Calculate overdue penalties';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $schedules = LoanSchedule::where('status', '!=', 'paid')
            ->whereDate('due_date', '<', now())
            ->get();

        foreach ($schedules as $schedule) {
            $penalty = PenaltyService::calculate($schedule);

            $schedule->update([
                'overdue_days' => $penalty['days'],
                'penalty_amount' => $penalty['amount'],
                'status' => $penalty['days'] > 0 ? 'overdue' : $schedule->status,
            ]);
        }
    }
}
