<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Location;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $locations = Location::all();
        $branches = Branch::with('location')->latest()->paginate(10);
        return Inertia::render('Branch/Index', [
            'locations' => $locations,
            'branches' => $branches,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
        ]);

        Branch::create($validated);

        return redirect()->route('branches.index')->with('success', 'Branch created successfully.');
    }

    public function update(Request $request, Branch $branches)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255' . $branches->id,
            'location_id' => 'exists:locations,id',
        ]);
        $branches->update($validated);
        return redirect()->route('branches.index')->with('success', 'Location updated successfully.');
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();
        return redirect()->route('branches.index')->with('success', 'Branch deleted successfully.');
    }
}
