import TicketChecker, { type LotteryPayload } from '@/components/lottery/TicketChecker';

export default function NumberChecker({ lotto }: { lotto: LotteryPayload | null }) {
    return <TicketChecker kind="thai" lotto={lotto} />;
}
