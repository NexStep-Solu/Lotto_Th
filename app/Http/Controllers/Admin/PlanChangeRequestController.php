<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlanChangeRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlanChangeRequestController extends Controller
{
    public function index(): Response
    {
        $requests = PlanChangeRequest::query()
            ->with(['user:id,name,email', 'reviewer:id,name'])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 ELSE 1 END")
            ->latest()
            ->paginate(25);

        return Inertia::render('Admin/PlanChangeRequests', [
            'requests' => $requests,
            'plans' => \App\Enums\SubscriptionPlan::options(),
        ]);
    }

    public function approve(Request $request, PlanChangeRequest $planChangeRequest): RedirectResponse
    {
        if ($planChangeRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been reviewed.');
        }

        $planChangeRequest->user?->forceFill(['plan' => $planChangeRequest->requested_plan])->save();

        $planChangeRequest->forceFill([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ])->save();

        return back()->with('success', 'Plan request approved.');
    }

    public function reject(Request $request, PlanChangeRequest $planChangeRequest): RedirectResponse
    {
        if ($planChangeRequest->status !== 'pending') {
            return back()->with('error', 'This request has already been reviewed.');
        }

        $planChangeRequest->forceFill([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ])->save();

        return back()->with('success', 'Plan request rejected.');
    }
}
