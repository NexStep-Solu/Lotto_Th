import TicketChecker, { type LotteryPayload } from '@/components/lottery/TicketChecker';

export default function SgNumberChecker({ lotto }: { lotto: LotteryPayload | null }) {
    return <TicketChecker kind="sg" lotto={lotto} />;
}
