'use client';

import DrawPicker from '@/components/lottery/DrawPicker';
import { convertThaiDate } from '@/lib/lottoTranslate';

export default function LotteryDatePicker({ onSelect }: { onSelect: (id: string) => void }) {
    return (
        <DrawPicker
            endpoint="/api/lotto/list"
            onSelect={onSelect}
            formatDate={convertThaiDate}
            label="Draw archive"
            description="Browse earlier Thai draws"
        />
    );
}
