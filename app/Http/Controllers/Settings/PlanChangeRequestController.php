<?php

namespace App\Http\Controllers\Settings;

use App\Enums\SubscriptionPlan;
use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use App\Services\SubscriptionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class PlanChangeRequestController extends Controller
{
    public function __construct(
        private readonly SubscriptionService $subscriptions,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', Rule::enum(SubscriptionPlan::class)],
            'message' => ['nullable', 'string', 'max:500'],
            'payment_proof' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $user = $request->user();

        if ($this->subscriptions->planFor($user)->value === $validated['plan']) {
            return back()->withErrors([
                'plan' => 'You are already on this plan.',
            ]);
        }

        $hasPending = PlanChangeRequest::query()
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return back()->withErrors([
                'plan' => 'You already have a pending plan request. Please wait for the administrator to review it.',
            ]);
        }

        $paymentProofPath = null;

        if ($request->hasFile('payment_proof')) {
            $paymentProofPath = $request->file('payment_proof')->store('payment-proofs', 'public');
        }

        PlanChangeRequest::create([
            'user_id' => $user->id,
            'requested_plan' => $validated['plan'],
            'message' => $validated['message'] ?? null,
            'payment_proof_path' => $paymentProofPath,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Your plan change request has been sent to the administrator.');
    }
}
