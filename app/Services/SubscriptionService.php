<?php

namespace App\Services;

use App\Enums\SubscriptionPlan;
use App\Exceptions\SubscriptionLimitException;
use App\Models\User;

class SubscriptionService
{
    /**
     * Roll the usage counters over when a new calendar month begins.
     */
    public function syncPeriod(User $user): void
    {
        $periodStart = now()->startOfMonth();

        $isNewPeriod = $user->usage_period_start === null
            || $user->usage_period_start->lt($periodStart);

        if ($isNewPeriod) {
            $user->forceFill([
                'usage_period_start' => $periodStart,
                'plan_renews_at' => $periodStart->copy()->addMonthNoOverflow(),
                'draw_usage' => [],
            ])->save();

            return;
        }

        if ($user->plan_renews_at === null) {
            $user->forceFill([
                'plan_renews_at' => $periodStart->copy()->addMonthNoOverflow(),
            ])->save();
        }
    }

    public function planFor(User $user): SubscriptionPlan
    {
        $plan = $user->plan;

        if ($plan instanceof SubscriptionPlan) {
            return $plan;
        }

        return SubscriptionPlan::tryFrom((string) $plan) ?? SubscriptionPlan::Basic;
    }

    /**
     * @return array<string, mixed>
     */
    public function snapshot(User $user): array
    {
        $this->syncPeriod($user);

        $plan = $this->planFor($user);
        $usage = $user->draw_usage ?? [];

        $ticketsUsed = array_sum(array_map('intval', $usage));
        $drawsUsed = count($usage);

        $unlimited = $user->role === 'admin' || $user->hasRole('admin');

        return [
            'plan' => $plan->value,
            'label' => $plan->label(),
            'tagline' => $plan->tagline(),
            'price' => $plan->price(),
            'currency' => $plan->currency(),
            'features' => $plan->features(),
            'unlimited' => $unlimited,
            'limits' => [
                'draws_per_month' => $plan->drawsPerMonth(),
                'tickets_per_draw' => $plan->ticketsPerDraw(),
                'total_tickets' => $plan->totalTickets(),
            ],
            'usage' => [
                'tickets_used' => $ticketsUsed,
                'tickets_remaining' => $unlimited ? $plan->totalTickets() : max(0, $plan->totalTickets() - $ticketsUsed),
                'draws_used' => $drawsUsed,
                'draws_remaining' => $unlimited ? $plan->drawsPerMonth() : max(0, $plan->drawsPerMonth() - $drawsUsed),
                'used_draws' => array_keys($usage),
                'renews_at' => $user->plan_renews_at?->toIso8601String(),
                'period_start' => $user->usage_period_start?->toIso8601String(),
            ],
        ];
    }

    /**
     * Record tickets checked against one draw and enforce the plan limits.
     *
     * @return array<string, mixed>
     *
     * @throws SubscriptionLimitException
     */
    public function record(User $user, string $drawKey, int $tickets): array
    {
        if ($user->role === 'admin' || $user->hasRole('admin')) {
            return $this->snapshot($user);
        }

        $this->syncPeriod($user);

        $plan = $this->planFor($user);
        $usage = $user->draw_usage ?? [];

        $ticketsUsed = array_sum(array_map('intval', $usage));
        $ticketsForDraw = (int) ($usage[$drawKey] ?? 0);

        if (!array_key_exists($drawKey, $usage) && count($usage) >= $plan->drawsPerMonth()) {
            throw new SubscriptionLimitException(
                "Your {$plan->label()} plan includes {$plan->drawsPerMonth()} draws per month. Switch plans in Settings → Plan & usage.",
            );
        }

        $perDraw = $plan->ticketsPerDraw();

        if ($perDraw !== null && $ticketsForDraw + $tickets > $perDraw) {
            throw new SubscriptionLimitException(
                "Your {$plan->label()} plan allows {$perDraw} tickets per draw. This draw already used {$ticketsForDraw}.",
            );
        }

        if ($ticketsUsed + $tickets > $plan->totalTickets()) {
            $remaining = max(0, $plan->totalTickets() - $ticketsUsed);

            throw new SubscriptionLimitException(
                "Your {$plan->label()} plan has {$remaining} tickets left this month. Upgrade to Pro for 2,000 tickets.",
            );
        }

        $usage[$drawKey] = $ticketsForDraw + $tickets;

        $user->forceFill(['draw_usage' => $usage])->save();

        return $this->snapshot($user);
    }
}
