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
        return $this->cachedJson($this->lottoScraper->getLatest(), 300);
    }

    public function show(string $id): JsonResponse
    {
        abort_unless(preg_match('/^\d{8}$/', $id) === 1, 404);

        return $this->cachedJson($this->lottoScraper->getByDate($id), 21600);
    }

    public function list(): JsonResponse
    {
        return $this->cachedJson([
            'response' => $this->lottoScraper->getAvailableDates(),
        ], 900);
    }

    /**
     * Lottery results are public and change at most twice a month. Let the
     * browser and CDN reuse a response instead of re-scraping the source.
     */
    private function cachedJson(array $data, int $maxAge): JsonResponse
    {
        return response()
            ->json($data)
            ->header('Cache-Control', "public, max-age={$maxAge}, stale-while-revalidate=600");
    }
}
