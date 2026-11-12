declare module 'canvas-confetti' {
    type Shape = 'square' | 'circle' | 'star';

    interface ConfettiOptions {
        particleCount?: number;
        angle?: number;
        spread?: number;
        startVelocity?: number;
        decay?: number;
        gravity?: number;
        drift?: number;
        ticks?: number;
        origin?: { x?: number; y?: number };
        colors?: string[];
        shapes?: Shape[];
        scalar?: number;
        zIndex?: number;
        disableForReducedMotion?: boolean;
    }

    interface Confetti {
        (options?: ConfettiOptions): Promise<null>;
        reset(): void;
        create(canvas: HTMLCanvasElement, options?: { resize?: boolean; useWorker?: boolean }): Confetti;
    }

    const confetti: Confetti;

    export default confetti;
}
