'use client';

import DrawPicker from '@/components/lottery/DrawPicker';

export default function SgLotteryDatePicker({ onSelect }: { onSelect: (id: string) => void }) {
    return (
        <DrawPicker
            endpoint="/api/lotto/sg/list"
            onSelect={onSelect}
            label="Draw archive"
            description="Browse earlier Singapore Sweep draws"
            sortDescending
        />
    );
}
