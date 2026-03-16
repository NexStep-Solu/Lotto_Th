<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Employee;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'admin', 'guard_name' => 'web']
        );

        $managerRole = Role::firstOrCreate(
            ['name' => 'manager', 'guard_name' => 'web'],
            ['name' => 'manager', 'guard_name' => 'web']
        );

        $employeeRole = Role::firstOrCreate(
            ['name' => 'employee', 'guard_name' => 'web'],
            ['name' => 'employee', 'guard_name' => 'web']
        );

        // Create Departments
        $itDepartment = Department::firstOrCreate(
            ['name' => 'IT'],
            ['description' => 'Information Technology Department']
        );

        $hrDepartment = Department::firstOrCreate(
            ['name' => 'Human Resources'],
            ['description' => 'Human Resources Department']
        );

        $financeDepartment = Department::firstOrCreate(
            ['name' => 'Finance'],
            ['description' => 'Finance and Accounting Department']
        );

        $salesDepartment = Department::firstOrCreate(
            ['name' => 'Sales'],
            ['description' => 'Sales and Marketing Department']
        );

        // Create Admin User with Employee Info
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
        $adminUser->assignRole($adminRole);
        $adminUser->employee()->create([
            'employee_id' => 'EMP001',
            'phone' => '+1234567890',
            'address' => '123 Admin Street',
            'date_of_birth' => '1990-01-01',
            'hire_date' => '2020-01-01',
            'position' => 'System Administrator',
            'department_id' => $itDepartment->id,
            'salary' => 75000.00,
            'status' => 'active',
        ]);

        // Create Manager User with Employee Info
        $managerUser = User::create([
            'name' => 'John Manager',
            'email' => 'manager@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $managerUser->assignRole($managerRole);
        $managerUser->employee()->create([
            'employee_id' => 'EMP002',
            'phone' => '+1234567891',
            'address' => '456 Manager Avenue',
            'date_of_birth' => '1985-05-15',
            'hire_date' => '2021-03-15',
            'position' => 'Department Manager',
            'department_id' => $hrDepartment->id,
            'salary' => 65000.00,
            'status' => 'active',
        ]);

        // Create Employee Users
        $employee1 = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'sarah@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $employee1->assignRole($employeeRole);
        $employee1->employee()->create([
            'employee_id' => 'EMP003',
            'phone' => '+1234567892',
            'address' => '789 Employee Road',
            'date_of_birth' => '1992-08-20',
            'hire_date' => '2022-06-01',
            'position' => 'Software Developer',
            'department_id' => $itDepartment->id,
            'salary' => 55000.00,
            'status' => 'active',
        ]);

        $employee2 = User::create([
            'name' => 'Alice Smith',
            'email' => 'alice@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $employee2->assignRole($employeeRole);
        $employee2->employee()->create([
            'employee_id' => 'EMP004',
            'phone' => '+1234567893',
            'address' => '321 Finance Lane',
            'date_of_birth' => '1995-03-10',
            'hire_date' => '2023-01-10',
            'position' => 'Accountant',
            'department_id' => $financeDepartment->id,
            'salary' => 50000.00,
            'status' => 'active',
        ]);

        $employee3 = User::create([
            'name' => 'Bob Williams',
            'email' => 'bob@gmail.com',
            'password' => Hash::make('password'),
        ]);
        $employee3->assignRole($employeeRole);
        $employee3->employee()->create([
            'employee_id' => 'EMP005',
            'phone' => '+1234567894',
            'address' => '654 Sales Boulevard',
            'date_of_birth' => '1993-11-25',
            'hire_date' => '2022-09-15',
            'position' => 'Sales Representative',
            'department_id' => $salesDepartment->id,
            'salary' => 48000.00,
            'status' => 'active',
        ]);

        // Seed all permissions and assign them to admin user (admin@gmail.com)
        $this->call(PermissionSeeder::class);
    }
}
