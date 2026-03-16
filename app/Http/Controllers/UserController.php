<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    public function index()
    {
        $users = User::with(['employee', 'roles'])->latest()->paginate(10);

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => Role::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::all(),
            'departments' => Department::all(),
            'branches' => Branch::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'branch_id' => 'nullable|exists:branches,id',
            'bio' => 'nullable|string',
            // Employee fields
            'employee_id' => 'nullable|string|unique:employees,employee_id',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'hire_date' => 'nullable|date',
            'position' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'salary' => 'nullable|numeric|min:0',
        ]);

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'branch_id' => $validated['branch_id'] ?? null,
            'bio' => $validated['bio'] ?? null,
        ]);

        // Assign role
        $role = Role::findOrFail($validated['role_id']);
        $user->assignRole($role);

        // Create employee record
        $user->employee()->create([
            'employee_id' => $validated['employee_id'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'hire_date' => $validated['hire_date'] ?? null,
            'position' => $validated['position'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'salary' => $validated['salary'] ?? null,
            'status' => 'active',
        ]);

        return redirect()->route('users.index')->with('success', 'User created successfully with employee information.');
    }

    public function show(User $user)
    {
        $user->load(['employee.department', 'roles', 'branch']);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $user->load(['employee', 'roles']);

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(),
            'departments' => Department::all(),
            'branches' => Branch::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        if ($request->has('active') && $request->keys() === ['active']) {
            $request->validate([
                'active' => 'required|in:active,inactive',
            ]);

            $user->active = $request->input('active');
            $user->save();

            return redirect()->route('users.index')->with('success', 'User status updated successfully.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'required|exists:roles,id',
            'branch_id' => 'nullable|exists:branches,id',
            'bio' => 'nullable|string',
            // Employee fields
            'employee_id' => 'nullable|string|unique:employees,employee_id,' . ($user->employee?->id ?? 'NULL'),
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date',
            'hire_date' => 'nullable|date',
            'position' => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,terminated',
        ]);

        // Update user
        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'branch_id' => $validated['branch_id'] ?? null,
            'bio' => $validated['bio'] ?? null,
        ];

        if ($request->filled('password')) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        // Update role
        $role = Role::findOrFail($validated['role_id']);
        $user->syncRoles([$role]);

        // Update or create employee record
        $employeeData = [
            'employee_id' => $validated['employee_id'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'date_of_birth' => $validated['date_of_birth'] ?? null,
            'hire_date' => $validated['hire_date'] ?? null,
            'position' => $validated['position'] ?? null,
            'department_id' => $validated['department_id'] ?? null,
            'salary' => $validated['salary'] ?? null,
        ];

        if (isset($validated['status'])) {
            $employeeData['status'] = $validated['status'];
        }

        if ($user->employee) {
            $user->employee->update($employeeData);
        } else {
            $user->employee()->create(array_merge($employeeData, ['status' => 'active']));
        }

        return redirect()->route('users.show', $user)->with('success', 'User updated successfully.');
    }


    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}
