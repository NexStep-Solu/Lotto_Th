<?php

namespace App\Enums;

enum SubscriptionPlan: string
{
    case Basic = 'basic';
    case Pro = 'pro';

    public function label(): string
    {
        return match ($this) {
            self::Basic => 'Basic',
            self::Pro => 'Pro',
        };
    }

    public function price(): int
    {
        return match ($this) {
            self::Basic => 3000,
            self::Pro => 10000,
        };
    }

    public function currency(): string
    {
        return 'MMK';
    }

    public function drawsPerMonth(): int
    {
        return 2;
    }

    /**
     * A per-draw ticket cap. Pro has flexible usage, bounded only by the
     * monthly total.
     */
    public function ticketsPerDraw(): ?int
    {
        return match ($this) {
            self::Basic => 250,
            self::Pro => null,
        };
    }

    public function totalTickets(): int
    {
        return match ($this) {
            self::Basic => 500,
            self::Pro => 2000,
        };
    }

    public function tagline(): string
    {
        return match ($this) {
            self::Basic => 'For a single counter',
            self::Pro => 'For busy ticket desks',
        };
    }

    /**
     * @return list<string>
     */
    public function features(): array
    {
        return match ($this) {
            self::Basic => [
                '2 draws per month',
                '250 tickets per draw',
                '500 tickets total',
                'Image OCR, manual & Excel checking',
            ],
            self::Pro => [
                '2 draws per month',
                '2,000 tickets total',
                'Flexible ticket usage',
                'Bulk image checking',
                'Checking history',
            ],
        };
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function options(): array
    {
        return array_map(fn (self $plan): array => [
            'value' => $plan->value,
            'label' => $plan->label(),
            'tagline' => $plan->tagline(),
            'price' => $plan->price(),
            'currency' => $plan->currency(),
            'draws_per_month' => $plan->drawsPerMonth(),
            'tickets_per_draw' => $plan->ticketsPerDraw(),
            'total_tickets' => $plan->totalTickets(),
            'features' => $plan->features(),
        ], self::cases());
    }
}
