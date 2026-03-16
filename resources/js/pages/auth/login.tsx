import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import ColorBends from '@/components/ColorBends';
import Cubes from '@/components/Cubes';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />
            <div className="pointer-events-none fixed inset-0">
                <div className="absolute inset-0">
                    <ColorBends
                        rotation={190}
                        speed={0.5}
                        colors={['#0aff68', '#62f4dc', '#66ffa1']}
                        transparent
                        autoRotate={0}
                        scale={1}
                        frequency={1}
                        warpStrength={1}
                        mouseInfluence={1}
                        parallax={0.5}
                        noise={0.1}
                        className="absolute inset-0"
                    />
                </div>
            </div>
            <div className="fixed top-6 left-6 z-20 rounded-xl bg-white/70 px-3 py-2 backdrop-blur-md dark:bg-black/50">
                <a href="/" className="flex items-center gap-2 font-medium transition hover:opacity-80">
                    <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <img src="./favicon.ico" alt="Unity Microfinance" />
                    </div>
                    <span className="hidden sm:inline">Unity Microfinance Ltd.</span>
                </a>
            </div>

            <div className="relative z-10 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-4xl">
                    <div className="flex flex-col gap-6">
                        <Card className="overflow-hidden bg-white/80 p-0 backdrop-blur-xl dark:bg-black/70">
                            <CardContent className="grid p-0 md:grid-cols-2">
                                <div className="flex flex-col gap-4 p-6 md:p-10">
                                    <div className="flex flex-1 items-center justify-center">
                                        <div className="w-full max-w-xs">
                                            <form className="flex flex-col gap-6" onSubmit={submit}>
                                                <h1>Log in to your account</h1>
                                                <p className="text-xs">Enter your email and password below to log in</p>
                                                <div className="grid gap-6">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="email">Email address</Label>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            required
                                                            autoFocus
                                                            tabIndex={1}
                                                            autoComplete="email"
                                                            value={data.email}
                                                            onChange={(e) => setData('email', e.target.value)}
                                                            placeholder="email@example.com"
                                                        />
                                                        <InputError message={errors.email} />
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <div className="flex items-center">
                                                            <Label htmlFor="password">Password</Label>
                                                            {canResetPassword && (
                                                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                                                    Forgot password?
                                                                </TextLink>
                                                            )}
                                                        </div>
                                                        <Input
                                                            id="password"
                                                            type="password"
                                                            required
                                                            tabIndex={2}
                                                            autoComplete="current-password"
                                                            value={data.password}
                                                            onChange={(e) => setData('password', e.target.value)}
                                                            placeholder="Password"
                                                        />
                                                        <InputError message={errors.password} />
                                                    </div>

                                                    <div className="flex items-center space-x-3">
                                                        <Checkbox
                                                            id="remember"
                                                            name="remember"
                                                            checked={data.remember}
                                                            onClick={() => setData('remember', !data.remember)}
                                                            tabIndex={3}
                                                        />
                                                        <Label htmlFor="remember">Remember me</Label>
                                                    </div>

                                                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                        Log in
                                                    </Button>
                                                    {/* <div className="my-4 flex items-center">
                                        <div className="flex-grow border-t"></div>
                                        <span className="text-muted-foreground px-2 text-sm">OR</span>
                                        <div className="flex-grow border-t"></div>
                                    </div>

                                    <a
                                        href={route('google.login')}
                                        className="hover:bg-primary flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition"
                                    >
                                        <img src="/google.png" alt="Google" className="h-5 w-5" />
                                        Continue with Google
                                    </a> */}
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-muted relative hidden md:block ">
                                    <Cubes
                                        gridSize={8}
                                        maxAngle={45}
                                        radius={3}
                                        borderStyle="3px solid #fff"
                                        faceColor="#1a1a2e"
                                        rippleColor="#ff6b6b"
                                        rippleSpeed={1.5}
                                        autoAnimate
                                        rippleOnClick
                                    />  
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </>
    );
}
