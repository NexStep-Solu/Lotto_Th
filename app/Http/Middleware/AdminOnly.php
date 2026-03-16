<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    /**
     * Allow access if user is admin (role enum or Spatie role) or has any permission.
     * This lets manager/employee with assigned permissions access the admin area;
     * the sidebar and buttons still hide by permission on the frontend.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth()->user();

        if (!$user) {
            abort(403, 'You do not have permission to access this page.');
        }

        // Admin by legacy role enum
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Admin by Spatie role
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // Any user with at least one permission can access (e.g. manager/employee with view_users, etc.)
        if ($user->getAllPermissions()->isNotEmpty()) {
            return $next($request);
        }

        abort(403, 'You do not have permission to access this page.');
    }
}
