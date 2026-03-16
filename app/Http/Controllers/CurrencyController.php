<?php

namespace App\Http\Controllers;

use App\Models\Currency;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function index()
    {

        return inertia('Currency/Index', [
            'currencies' => Currency::latest()->get()
        ]);
    }

    public function create()
    {
        return inertia('Currency/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'code' => 'required|unique:currencies',
            'symbol' => 'required',
            'rate' => 'required|numeric'
        ]);

        Currency::create($data);

        return redirect()->route('currencies.index')
            ->with('success', 'Currency created');
    }

    public function edit(Currency $currency)
    {
        return inertia('Currency/Edit', [
            'currency' => $currency
        ]);
    }

    public function update(Request $request, Currency $currency)
    {
        $data = $request->validate([
            'name' => 'required',
            'code' => "required|unique:currencies,code,$currency->id",
            'symbol' => 'required',
            'rate' => 'required|numeric'
        ]);

        $currency->update($data);

        return redirect()->route('currencies.index')
            ->with('success', 'Currency updated');
    }

    public function destroy(Currency $currency)
    {
        $currency->delete();

        return back()->with('success', 'Currency deleted');
    }
}
