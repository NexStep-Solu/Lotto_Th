<?php

namespace App\Http\Controllers;

use App\Exceptions\SubscriptionLimitException;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardUsageController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'draw' => ['required', 'string', 'max:80'],
            'tickets' => ['required', 'integer', 'min:1', 'max:2000'],
        ]);

        $user = $request->user();

        try {
            $snapshot = $this->subscriptions->record($user, $validated['draw'], $validated['tickets']);
        } catch (SubscriptionLimitException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
                'subscription' => $this->subscriptions->snapshot($user),
            ], 422);
        }

        return response()->json([
            'subscription' => $snapshot,
        ]);
    }
}
