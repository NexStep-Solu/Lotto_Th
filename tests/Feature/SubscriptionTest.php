<?php

use App\Enums\SubscriptionPlan;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('the dashboard shares the current plan and usage', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('subscription.plan', 'basic')
            ->where('subscription.limits.total_tickets', 500)
            ->where('subscription.usage.tickets_used', 0));
});

test('the plan and usage settings page renders both plans', function () {
    $this->actingAs(User::factory()->create())
        ->get('/settings/subscription')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/subscription')
            ->has('subscription')
            ->has('plans', 2));
});

test('usage is recorded against a draw and reflected in the snapshot', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->postJson('/dashboard/usage', [
            'draw' => 'thai:2026-11-01',
            'tickets' => 120,
        ])
        ->assertOk()
        ->assertJsonPath('subscription.usage.tickets_used', 120)
        ->assertJsonPath('subscription.usage.draws_used', 1)
        ->assertJsonPath('subscription.usage.tickets_remaining', 380);

    expect($user->fresh()->draw_usage)->toBe(['thai:2026-11-01' => 120]);
});

test('the basic per draw limit is enforced', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->postJson('/dashboard/usage', [
        'draw' => 'thai:2026-11-01',
        'tickets' => 250,
    ])->assertOk();

    $this->actingAs($user)->postJson('/dashboard/usage', [
        'draw' => 'thai:2026-11-01',
        'tickets' => 1,
    ])
        ->assertStatus(422)
        ->assertJsonPath('subscription.usage.tickets_used', 250);
});

test('a user can request a plan change and the request is sent to the administrator', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('subscription.request'), [
            'plan' => 'pro',
            'message' => 'Need bulk checking for the weekend draw.',
        ])
        ->assertRedirect();

    expect($user->fresh()->plan)->toBe(SubscriptionPlan::Basic);

    $this->actingAs($user)
        ->get('/settings/subscription')
        ->assertInertia(fn (Assert $page) => $page
            ->where('pendingRequest.requested_plan', 'pro')
            ->where('pendingRequest.message', 'Need bulk checking for the weekend draw.'));
});

test('a second pending request is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('subscription.request'), ['plan' => 'pro'])->assertRedirect();

    $this->actingAs($user)
        ->post(route('subscription.request'), ['plan' => 'pro'])
        ->assertSessionHasErrors('plan');
});

test('an administrator can approve a plan change request', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)->post(route('subscription.request'), ['plan' => 'pro'])->assertRedirect();

    $request = \App\Models\PlanChangeRequest::first();

    $this->actingAs($admin)
        ->post(route('admin.plan-requests.approve', $request))
        ->assertRedirect();

    expect($user->fresh()->plan)->toBe(SubscriptionPlan::Pro);
    expect($request->fresh()->status)->toBe('approved');
});

test('an administrator can reject a plan change request', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)->post(route('subscription.request'), ['plan' => 'pro'])->assertRedirect();

    $request = \App\Models\PlanChangeRequest::first();

    $this->actingAs($admin)
        ->post(route('admin.plan-requests.reject', $request))
        ->assertRedirect();

    expect($user->fresh()->plan)->toBe(SubscriptionPlan::Basic);
    expect($request->fresh()->status)->toBe('rejected');
});

test('an invalid plan request is rejected', function () {
    $this->actingAs(User::factory()->create())
        ->post(route('subscription.request'), ['plan' => 'enterprise'])
        ->assertSessionHasErrors('plan');
});

test('administrators have unlimited usage', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->postJson('/dashboard/usage', ['draw' => 'thai:2026-11-01', 'tickets' => 2000])
        ->assertOk()
        ->assertJsonPath('subscription.unlimited', true);

    $this->actingAs($admin)
        ->postJson('/dashboard/usage', ['draw' => 'thai:2026-11-02', 'tickets' => 2000])
        ->assertOk()
        ->assertJsonPath('subscription.unlimited', true);
});

test('guests cannot record usage', function () {
    $this->postJson('/dashboard/usage', [
        'draw' => 'thai:2026-11-01',
        'tickets' => 10,
    ])->assertUnauthorized();
});
