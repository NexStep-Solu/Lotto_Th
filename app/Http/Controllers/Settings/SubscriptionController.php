<?php

namespace App\Http\Controllers\Settings;

use App\Enums\SubscriptionPlan;
use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
    ) {}

    public function edit(Request $request): Response
    {
        $this->subscriptions->syncPeriod($request->user());

        $pendingRequest = PlanChangeRequest::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        return Inertia::render('settings/subscription', [
            'subscription' => $this->subscriptions->snapshot($request->user()),
            'plans' => SubscriptionPlan::options(),
            'pendingRequest' => $pendingRequest ? [
                'id' => $pendingRequest->id,
                'requested_plan' => $pendingRequest->requested_plan,
                'message' => $pendingRequest->message,
                'created_at' => $pendingRequest->created_at?->toIso8601String(),
            ] : null,
        ]);
    }
}
