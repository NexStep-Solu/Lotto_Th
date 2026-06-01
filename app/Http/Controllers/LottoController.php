<?php

namespace App\Http\Controllers;

use App\Services\LottoScraperService;
use Illuminate\Http\JsonResponse;

class LottoController extends Controller
{
    public function __construct(
        private readonly LottoScraperService $lottoScraper,
    ) {}

    public function latest(): JsonResponse
    {
        $data = $this->lottoScraper->getLatest();
        return response()->json($data);
    }

    public function show(string $id): JsonResponse
    {
        $data = $this->lottoScraper->getByDate($id);
        return response()->json($data);
    }

    public function list(): JsonResponse
    {
        $dates = $this->lottoScraper->getAvailableDates();
        return response()->json([
            'response' => $dates,
        ]);
    }
}
