<?php

namespace App\Http\Controllers;

use App\Services\SgLottoScraperService;
use Illuminate\Http\JsonResponse;

class SgLottoController extends Controller
{
    public function __construct(
        private readonly SgLottoScraperService $sgLottoScraper,
    ) {}

    public function latest(): JsonResponse
    {
        $data = $this->sgLottoScraper->getLatest();
        return response()->json($data);
    }

    public function show(string $id): JsonResponse
    {
        $data = $this->sgLottoScraper->getByDate($id);
        return response()->json($data);
    }

    public function list(): JsonResponse
    {
        $dates = $this->sgLottoScraper->getAvailableDates();
        return response()->json([
            'response' => $dates,
        ]);
    }
}
