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
        return $this->cachedJson($this->sgLottoScraper->getLatest(), 300);
    }

    public function show(string $id): JsonResponse
    {
        abort_unless(preg_match('/^singapore-sweep-\d{4}-\d{2}-\d{2}-\d+$/', $id) === 1, 404);

        return $this->cachedJson($this->sgLottoScraper->getByDate($id), 21600);
    }

    public function list(): JsonResponse
    {
        return $this->cachedJson([
            'response' => $this->sgLottoScraper->getAvailableDates(),
        ], 900);
    }

    private function cachedJson(array $data, int $maxAge): JsonResponse
    {
        return response()
            ->json($data)
            ->header('Cache-Control', "public, max-age={$maxAge}, stale-while-revalidate=600");
    }
}
