<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Http;

class SgLottoScraperService
{
    private const YELU_SWEEP_URL = 'https://www.yelu.sg/lottery/results/singapore-sweep';
    private const YELU_DRAW_URL = 'https://www.yelu.sg/lottery/draw/';

    public function getLatest(): array
    {
        $html = $this->fetchHtml(self::YELU_SWEEP_URL);
        return $this->parseResult($html);
    }

    public function getByDate(string $dateSlug): array
    {
        $url = self::YELU_DRAW_URL . 'singapore-sweep-' . $dateSlug;
        $html = $this->fetchHtml($url);
        return $this->parseResult($html);
    }

    public function getAvailableDates(): array
    {
        $html = $this->fetchHtml(self::YELU_SWEEP_URL);
        return $this->parseHistoryTable($html);
    }

    private function fetchHtml(string $url): string
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language' => 'en-SG,en;q=0.9',
        ])->timeout(15)->get($url);

        return $response->body();
    }

    private function parseResult(string $html): array
    {
        $dom = new DOMDocument();
        @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);

        $xpath = new DOMXPath($dom);

        $date = '';
        $drawNo = '';
        $prizes = [];

        $titleNode = $xpath->query("//div[contains(@class, 'lotto_title')]");
        if ($titleNode->length > 0) {
            $titleText = $titleNode->item(0)->textContent;
            if (preg_match('/\b(\d{1,2}\s+\w+,\s*\d{4})\b/', $titleText, $m)) {
                $date = $m[1];
            }
            if (preg_match('/#(\d+)/', $titleText, $m)) {
                $drawNo = $m[1];
            }
        }

        $prizeElements = $xpath->query("//*[contains(@class, 'l_prize')]");
        $seenPrizes = [];

        foreach ($prizeElements as $el) {
            $dataT = $el->getAttribute('data-lotto-t');
            $dataN = $el->getAttribute('data-lotto-n');

            if ($dataT && $dataN) {
                $numbers = preg_split('/\s+/', trim($dataN));
                $numbers = array_values(array_filter($numbers, fn($n) => $n !== ''));

                $id = $this->prizeIdFromTitle($dataT);

                if (!isset($seenPrizes[$id])) {
                    $seenPrizes[$id] = [
                        'id' => $id,
                        'name' => $this->prizeNameFromTitle($dataT),
                        'number' => [],
                        'reward' => $this->rewardFromTitle($dataT),
                    ];
                }

                $seenPrizes[$id]['number'] = array_merge($seenPrizes[$id]['number'], $numbers);
            }
        }

        $prizes = array_values($seenPrizes);

        $orderedIds = [
            'firstPrize', 'secondPrize', 'thirdPrize',
            'jackpotPrize', 'luckyPrize', 'giftPrize',
            'consolationPrize', 'participationPrize',
        ];

        $ordered = [];
        foreach ($orderedIds as $id) {
            foreach ($prizes as $p) {
                if ($p['id'] === $id) {
                    $ordered[] = $p;
                    break;
                }
            }
        }

        $remaining = array_filter($prizes, fn($p) => !in_array($p['id'], $orderedIds));
        $prizes = array_merge($ordered, array_values($remaining));

        $twoDLuck = [];
        if (isset($seenPrizes['twoDDelight'])) {
            $twoDLuck = $seenPrizes['twoDDelight']['number'];
            $prizes = array_filter($prizes, fn($p) => $p['id'] !== 'twoDDelight');
            $prizes = array_values($prizes);
        }

        return [
            'response' => [
                'date' => $date,
                'drawNo' => $drawNo,
                'prizes' => $prizes,
                'twoDLuck' => $twoDLuck,
            ],
        ];
    }

    private function parseHistoryTable(string $html): array
    {
        $dom = new DOMDocument();
        @$dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);

        $xpath = new DOMXPath($dom);
        $dates = [];

        $rows = $xpath->query("//table[tr/th[contains(text(), 'Draw Date')]]/tr[position()>1]");

        foreach ($rows as $row) {
            $cells = $row->getElementsByTagName('td');
            if ($cells->length < 6) continue;

            $dateText = trim($cells->item(0)->textContent);
            $firstPrize = '';
            $link = $cells->item(5)->getElementsByTagName('a')->item(0);
            $slug = '';

            if ($link) {
                $href = $link->getAttribute('href');
                if (preg_match('#/lottery/draw/(singapore-sweep-\d{4}-\d{2}-\d{2}-\d+)#', $href, $m)) {
                    $slug = $m[1];
                }
            }

            $prizeCells = [];
            for ($i = 2; $i <= 4; $i++) {
                $div = $cells->item($i)->getElementsByTagName('div')->item(0);
                if ($div) {
                    $prizeCells[] = trim($div->textContent);
                }
            }

            if ($dateText && $slug) {
                $dates[] = [
                    'id' => $slug,
                    'date' => $dateText,
                    'name' => 'Singapore Sweep - ' . $dateText,
                    'firstPrize' => $prizeCells[0] ?? '',
                ];
            }
        }

        return $dates;
    }

    private function prizeIdFromTitle(string $title): string
    {
        $title = strtolower($title);

        if (str_contains($title, '1st prize')) return 'firstPrize';
        if (str_contains($title, '2nd prize') || str_contains($title, '2st prize')) return 'secondPrize';
        if (str_contains($title, '3rd prize') || str_contains($title, '3st prize')) return 'thirdPrize';
        if (str_contains($title, 'jackpot')) return 'jackpotPrize';
        if (str_contains($title, 'lucky')) return 'luckyPrize';
        if (str_contains($title, 'gift')) return 'giftPrize';
        if (str_contains($title, 'consolation')) return 'consolationPrize';
        if (str_contains($title, 'participation')) return 'participationPrize';
        if (str_contains($title, '2d delight')) return 'twoDDelight';

        return 'prize_' . md5($title);
    }

    private function prizeNameFromTitle(string $title): string
    {
        if (preg_match('/^(.+?)\s+\@/', $title, $m)) {
            return trim($m[1]);
        }
        return $title;
    }

    private function rewardFromTitle(string $title): int
    {
        if (preg_match('/\$([\d,]+)/', $title, $m)) {
            return (int) str_replace(',', '', $m[1]);
        }
        return 0;
    }

    private function buildEmptyResponse(): array
    {
        return [
            'response' => [
                'date' => '',
                'drawNo' => '',
                'prizes' => [],
                'twoDLuck' => [],
            ],
        ];
    }
}
