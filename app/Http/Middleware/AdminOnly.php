<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    /**
     * Resource routes mapped to the exact permission required for each action.
     * Anything not listed here is denied for non-admin users, so a single
     * unrelated permission can no longer unlock the whole admin area.
     */
    private const ROUTE_PERMISSIONS = [
        'users.index' => 'view_users',
        'users.show' => 'view_user',
        'users.create' => 'create_user',
        'users.store' => 'create_user',
        'users.edit' => 'update_user',
        'users.update' => 'update_user',
        'users.destroy' => 'update_user',

        'roles.index' => 'view_roles',
        'roles.show' => 'view_roles',
        'roles.create' => 'create_roles',
        'roles.store' => 'create_roles',
        'roles.edit' => 'update_roles',
        'roles.update' => 'update_roles',
        'roles.destroy' => 'delete_roles',

        'permissions.index' => 'view_permissions',
        'permissions.show' => 'view_permissions',
        'permissions.create' => 'create_permissions',
        'permissions.store' => 'create_permissions',
        'permissions.edit' => 'update_permissions',
        'permissions.update' => 'update_permissions',
        'permissions.destroy' => 'delete_permissions',

        'departments.index' => 'view_departments',
        'departments.show' => 'view_departments',
        'departments.create' => 'create_departments',
        'departments.store' => 'create_departments',
        'departments.edit' => 'update_departments',
        'departments.update' => 'update_departments',
        'departments.destroy' => 'delete_departments',

        'branches.index' => 'view_branches',
        'branches.show' => 'view_branches',
        'branches.create' => 'create_branches',
        'branches.store' => 'create_branches',
        'branches.edit' => 'update_branches',
        'branches.update' => 'update_branches',
        'branches.destroy' => 'delete_branches',

        'locations.index' => 'view_locations',
        'locations.show' => 'view_locations',
        'locations.create' => 'create_locations',
        'locations.store' => 'create_locations',
        'locations.edit' => 'update_locations',
        'locations.update' => 'update_locations',
        'locations.destroy' => 'delete_locations',

        'currencies.index' => 'view_currencies',
        'currencies.show' => 'view_currencies',
        'currencies.create' => 'create_currencies',
        'currencies.store' => 'create_currencies',
        'currencies.edit' => 'update_currencies',
        'currencies.update' => 'update_currencies',
        'currencies.destroy' => 'delete_currencies',
    ];

    /**
     * Allow access if the user is an admin, or holds the specific permission
     * required by the route. Managers keep access to the cash workspace.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            abort(403, 'You do not have permission to access this page.');
        }

        if ($user->role === 'admin' || $user->hasRole('admin')) {
            return $next($request);
        }

        $routeName = $request->route()?->getName();

        if (!$routeName) {
            abort(403, 'You do not have permission to access this page.');
        }

        // Cash tools do not have granular permissions yet; keep them to managers.
        if (str_starts_with($routeName, 'cash.') || str_starts_with($routeName, 'cash-ledgers.')) {
            abort_unless(
                $user->hasRole('manager'),
                403,
                'You do not have permission to access this page.',
            );

            return $next($request);
        }

        if ($routeName === 'admin.dashboard') {
            abort_unless(
                $user->hasRole('manager'),
                403,
                'You do not have permission to access this page.',
            );

            return $next($request);
        }

        $permission = self::ROUTE_PERMISSIONS[$routeName] ?? null;

        abort_unless(
            $permission !== null && $user->can($permission),
            403,
            'You do not have permission to access this page.',
        );

        return $next($request);
    }
}
