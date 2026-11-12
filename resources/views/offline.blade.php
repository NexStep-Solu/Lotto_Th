<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>Offline — Lotto Ledger</title>
    <style>
        :root {
            color-scheme: light dark;
            --paper: #f3f0e7;
            --ink: #17251c;
            --muted: #5b6a60;
            --card: #fbf9f2;
            --line: rgba(23, 37, 28, 0.12);
            --forest: #0c5c43;
            --brass: #b08d57;
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --paper: #0b0f0d;
                --ink: #f1efe5;
                --muted: #a3b0a7;
                --card: rgba(255, 255, 255, 0.04);
                --line: rgba(255, 255, 255, 0.1);
                --forest: #14795a;
                --brass: #d8b47a;
            }
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            min-height: 100dvh;
            display: grid;
            place-items: center;
            padding: 1.5rem;
            background:
                radial-gradient(ellipse 75% 55% at 12% 0%, rgba(12, 92, 67, 0.14), transparent 60%),
                radial-gradient(ellipse 55% 45% at 95% 8%, rgba(176, 141, 87, 0.16), transparent 55%),
                var(--paper);
            color: var(--ink);
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        .card {
            width: 100%;
            max-width: 28rem;
            padding: 2.5rem;
            border: 1px solid var(--line);
            border-radius: 1rem;
            background: var(--card);
            text-align: center;
            box-shadow: 0 28px 60px -48px rgba(18, 32, 25, 0.55);
        }

        .mark {
            display: inline-flex;
            align-items: center;
            gap: 0.6rem;
            margin-bottom: 2rem;
            font-size: 0.8125rem;
            font-weight: 600;
            letter-spacing: -0.01em;
        }

        .mark span {
            display: grid;
            place-items: center;
            width: 2.25rem;
            height: 2.25rem;
            border-radius: 0.625rem;
            background: var(--forest);
            color: #f8f5ea;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 1.125rem;
        }

        .eyebrow {
            margin: 0;
            font-size: 0.6875rem;
            font-weight: 600;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--forest);
        }

        h1 {
            margin: 0.5rem 0 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(2.25rem, 8vw, 3rem);
            font-weight: 400;
            line-height: 0.95;
            letter-spacing: -0.02em;
        }

        p {
            margin: 0.9rem auto 0;
            max-width: 22rem;
            color: var(--muted);
            font-size: 0.875rem;
            line-height: 1.65;
        }

        a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 1.5rem;
            padding: 0.7rem 1rem;
            border-radius: 0.75rem;
            background: var(--forest);
            color: #f8f5ea;
            font-size: 0.75rem;
            font-weight: 600;
            text-decoration: none;
        }

        a:hover { filter: brightness(1.08); }

        .note {
            margin-top: 1.4rem;
            padding-top: 1rem;
            border-top: 1px dashed var(--line);
            font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
            font-size: 0.625rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--muted);
        }
    </style>
</head>
<body>
    <main class="card">
        <div class="mark"><span>L</span> Lotto Ledger</div>
        <p class="eyebrow">Connection lost</p>
        <h1>You&rsquo;re offline</h1>
        <p>The lotto desk needs a connection to load a new draw. Anything already on this page stays readable while you wait.</p>
        <a href="/">Try again</a>
        <div class="note">Your ticket numbers are never uploaded</div>
    </main>
</body>
</html>
