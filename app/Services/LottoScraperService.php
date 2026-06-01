<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class LottoScraperService
{
    private const SANOOK_LOTTO_URL = 'https://news.sanook.com/lotto/';
    private const SANOOK_CHECK_URL = 'https://news.sanook.com/lotto/check/';

    public function getLatest(): array
    {
        $dates = $this->getAvailableDates();
        if (empty($dates)) {
            return $this->fallbackLatest();
        }
        $latest = $dates[0];
        return $this->getByDate($latest['id']);
    }

    public function getByDate(string $dateId): array
    {
        $url = self::SANOOK_CHECK_URL . $dateId . '/';
        $html = $this->fetchHtml($url);
        $jsonLd = $this->extractNewsArticleJsonLd($html);
        if (!$jsonLd || empty($jsonLd['articleBody'])) {
            return $this->buildEmptyResponse();
        }
        return $this->parseArticleBody($jsonLd['articleBody'], $dateId);
    }

    public function getAvailableDates(): array
    {
        $html = $this->fetchHtml(self::SANOOK_LOTTO_URL);
        $dates = [];

        $newsDate = $this->getDateFromNewsArticle($html);
        if ($newsDate) {
            $dates[] = $newsDate;
        }

        $jsonLd = $this->extractItemListJsonLd($html);

        if ($jsonLd && !empty($jsonLd['itemListElement'])) {
            foreach ($jsonLd['itemListElement'] as $item) {
                $url = $item['url'] ?? '';
                if (preg_match('#/lotto/check/(\d+)/#', $url, $m)) {
                    $id = $m[1];
                    if ($newsDate && $id === $newsDate['id']) {
                        continue;
                    }
                    $name = $item['name'] ?? '';
                    $date = $this->extractDateFromName($name);
                    $dates[] = [
                        'id' => $id,
                        'date' => $date ?: $name,
                        'name' => $name,
                    ];
                }
            }
        }

        return $dates;
    }

    private function getDateFromNewsArticle(string $html): ?array
    {
        $jsonLd = $this->extractNewsArticleJsonLd($html);
        if (!$jsonLd || empty($jsonLd['articleBody'])) {
            return null;
        }

        $body = html_entity_decode($jsonLd['articleBody'], ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $date = $this->extractDateFromBody($body);
        if (!$date) {
            return null;
        }

        $id = $this->dateIdFromThaiDate($date);
        return [
            'id' => $id,
            'date' => $date,
            'name' => 'ตรวจสลากกินแบ่งรัฐบาล ' . $date,
        ];
    }

    private function fallbackLatest(): array
    {
        $html = $this->fetchHtml(self::SANOOK_LOTTO_URL);
        $jsonLd = $this->extractNewsArticleJsonLd($html);
        if (!$jsonLd || empty($jsonLd['articleBody'])) {
            return $this->buildEmptyResponse();
        }
        $buddhistYear = date('Y') + 543;
        $dateId = date('dm') . $buddhistYear;
        return $this->parseArticleBody($jsonLd['articleBody'], $dateId);
    }

    private function fetchHtml(string $url): string
    {
        $response = Http::withHeaders([
            'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept' => 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language' => 'th-TH,th;q=0.9,en;q=0.8',
        ])->timeout(15)->get($url);

        return $response->body();
    }

    private function extractNewsArticleJsonLd(string $html): ?array
    {
        preg_match_all(
            '/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is',
            $html,
            $matches
        );

        foreach ($matches[1] as $json) {
            $data = json_decode(trim($json), true);
            if (json_last_error() === JSON_ERROR_NONE && ($data['@type'] ?? '') === 'NewsArticle') {
                return $data;
            }
        }
        return null;
    }

    private function extractItemListJsonLd(string $html): ?array
    {
        preg_match_all(
            '/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/is',
            $html,
            $matches
        );

        foreach ($matches[1] as $json) {
            $data = json_decode(trim($json), true);
            if (json_last_error() === JSON_ERROR_NONE && ($data['@type'] ?? '') === 'ItemList') {
                return $data;
            }
        }
        return null;
    }

    private function parseArticleBody(string $body, string $dateId): array
    {
        $body = html_entity_decode($body, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        $body = str_replace("\u{00A0}", ' ', $body);
        $body = str_replace("\r", '', $body);
        $lines = explode("\n", $body);
        $lines = array_map('trim', $lines);
        $lines = array_values(array_filter($lines, fn($l) => $l !== ''));

        $date = $this->extractDateFromBody($body);

        $prizes = [];
        $runningNumbers = [];

        $prizePatterns = [
            'prizeFirstNear' => ['keyword' => 'รางวัลข้างเคียงรางวัลที่ 1', 'name' => 'รางวัลข้างเคียงรางวัลที่ 1', 'reward' => 100000],
            'prizeFirst'     => ['keyword' => 'รางวัลที่ 1', 'name' => 'รางวัลที่ 1', 'reward' => 6000000],
            'prizeSecond'    => ['keyword' => 'รางวัลที่ 2', 'name' => 'รางวัลที่ 2', 'reward' => 200000],
            'prizeThird'     => ['keyword' => 'รางวัลที่ 3', 'name' => 'รางวัลที่ 3', 'reward' => 80000],
            'prizeFourth'    => ['keyword' => 'รางวัลที่ 4', 'name' => 'รางวัลที่ 4', 'reward' => 40000],
            'prizeFifth'     => ['keyword' => 'รางวัลที่ 5', 'name' => 'รางวัลที่ 5', 'reward' => 20000],
        ];

        $runningPatterns = [
            'runningNumberFrontThree' => ['keyword' => 'รางวัลเลขหน้า 3 ตัว', 'name' => 'รางวัลเลขหน้า 3 ตัว', 'reward' => 4000],
            'runningNumberBackThree'  => ['keyword' => 'รางวัลเลขท้าย 3 ตัว', 'name' => 'รางวัลเลขท้าย 3 ตัว', 'reward' => 4000],
            'runningNumberBackTwo'    => ['keyword' => 'รางวัลเลขท้าย 2 ตัว', 'name' => 'รางวัลเลขท้าย 2 ตัว', 'reward' => 2000],
        ];

        $i = 0;
        while ($i < count($lines)) {
            $line = $lines[$i];
            $matched = null;

            foreach ($prizePatterns as $id => $cfg) {
                if (str_contains($line, $cfg['keyword'])) {
                    $matched = ['type' => 'prize', 'id' => $id, 'cfg' => $cfg];
                    break;
                }
            }

            if (!$matched) {
                foreach ($runningPatterns as $id => $cfg) {
                    if (str_contains($line, $cfg['keyword'])) {
                        $matched = ['type' => 'running', 'id' => $id, 'cfg' => $cfg];
                        break;
                    }
                }
            }

            if ($matched) {
                $numbers = [];
                $j = $i + 1;
                while ($j < count($lines)) {
                    $nextLine = $lines[$j];
                    if (preg_match('/^\d[\d ]*$/', $nextLine)) {
                        $nums = preg_split('/\s+/', $nextLine);
                        $numbers = array_merge($numbers, $nums);
                        $j++;
                    } else {
                        break;
                    }
                }

                if (!empty($numbers)) {
                    $entry = [
                        'id' => $matched['id'],
                        'name' => $matched['cfg']['name'],
                        'number' => $numbers,
                        'reward' => $matched['cfg']['reward'],
                    ];

                    if ($matched['type'] === 'prize') {
                        $prizes[] = $entry;
                    } else {
                        $runningNumbers[] = $entry;
                    }
                }

                $i = $j;
                continue;
            }

            $i++;
        }

        return [
            'response' => [
                'date' => $date,
                'prizes' => $prizes,
                'runningNumbers' => $runningNumbers,
            ],
        ];
    }

    private function extractDateFromBody(string $body): string
    {
        if (preg_match('/(\d{1,2})\s+(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+(\d{4})/', $body, $m)) {
            return $m[1] . ' ' . $m[2] . ' ' . $m[3];
        }
        return date('j F Y');
    }

    private function extractDateFromName(string $name): ?string
    {
        if (preg_match('/(\d{1,2})\s+(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+(\d{4})/', $name, $m)) {
            return $m[1] . ' ' . $m[2] . ' ' . $m[3];
        }
        return null;
    }

    private function dateIdFromThaiDate(string $thaiDate): string
    {
        $months = [
            'มกราคม' => 1, 'กุมภาพันธ์' => 2, 'มีนาคม' => 3, 'เมษายน' => 4,
            'พฤษภาคม' => 5, 'มิถุนายน' => 6, 'กรกฎาคม' => 7, 'สิงหาคม' => 8,
            'กันยายน' => 9, 'ตุลาคม' => 10, 'พฤศจิกายน' => 11, 'ธันวาคม' => 12,
        ];

        if (preg_match('/(\d{1,2})\s+(มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม)\s+(\d{4})/', $thaiDate, $m)) {
            $day = str_pad($m[1], 2, '0', STR_PAD_LEFT);
            $month = str_pad($months[$m[2]], 2, '0', STR_PAD_LEFT);
            return $day . $month . $m[3];
        }

        return '';
    }

    private function formatThaiDate(int $day, int $month, int $thaiYear): string
    {
        $months = [
            1 => 'มกราคม', 2 => 'กุมภาพันธ์', 3 => 'มีนาคม', 4 => 'เมษายน',
            5 => 'พฤษภาคม', 6 => 'มิถุนายน', 7 => 'กรกฎาคม', 8 => 'สิงหาคม',
            9 => 'กันยายน', 10 => 'ตุลาคม', 11 => 'พฤศจิกายน', 12 => 'ธันวาคม',
        ];
        return $day . ' ' . ($months[$month] ?? '') . ' ' . $thaiYear;
    }

    private function buildEmptyResponse(): array
    {
        return [
            'response' => [
                'date' => '',
                'prizes' => [],
                'runningNumbers' => [],
            ],
        ];
    }
}
