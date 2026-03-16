<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * All permissions used in the application (sidebar, create, edit, view, delete).
     */
    protected array $permissions = [
        // Users
        'view_users',
        'view_user',
        'create_user',
        'update_user',
        'active_user',
        // Roles
        'view_roles',
        'create_roles',
        'update_roles',
        'delete_roles',
        // Permissions
        'view_permissions',
        'create_permissions',
        'update_permissions',
        'delete_permissions',
        // Branches
        'view_branches',
        'create_branches',
        'update_branches',
        'delete_branches',
        // Departments
        'view_departments',
        'create_departments',
        'update_departments',
        'delete_departments',
        // Locations
        'view_locations',
        'create_locations',
        'update_locations',
        'delete_locations',
        // Currencies
        'view_currencies',
        'create_currencies',
        'update_currencies',
        'delete_currencies',
        // Customers
        'view_customers',
        'create_customers',
        'update_customers',
    ];

    /**
     * Admin email that receives all permissions.
     * Set ADMIN_EMAIL in .env to use a different email.
     */
    protected function adminEmail(): string
    {
        return config('app.admin_email', env('ADMIN_EMAIL', 'admin@gmail.com'));
    }

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $guardName = config('auth.defaults.guard', 'web');
        $adminEmail = $this->adminEmail();

        foreach ($this->permissions as $name) {
            Permission::firstOrCreate(
                ['name' => $name, 'guard_name' => $guardName],
                ['name' => $name, 'guard_name' => $guardName]
            );
        }

        $adminUser = User::where('email', $adminEmail)->first();

        if ($adminUser) {
            $adminUser->givePermissionTo(Permission::all());
            $this->command->info("All permissions assigned to admin user: {$adminEmail}");
        } else {
            $this->command->warn("Admin user with email '{$adminEmail}' not found. Run DatabaseSeeder first or create the user.");
        }
    }
}
