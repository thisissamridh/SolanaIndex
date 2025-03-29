
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const { signInWithGoogle, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();


    useEffect(() => {
        if (user) {
            router.push('/dashboard');
        }
    }, [user, router]);

    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            await signInWithGoogle();

        } catch (error) {
            console.error('Failed to sign in:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-black text-white">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b border-green-900/20 max-w-screen-2xl mx-auto w-full">
                <Link className="flex items-center justify-center" href="/">
                    <Layers className="h-6 w-6 text-green-500" />
                    <span className="ml-2 text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                        SolanaIndex
                    </span>
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link
                        className="text-sm font-medium text-gray-300 hover:text-green-400 hover:underline underline-offset-4"
                        href="/"
                    >
                        Home
                    </Link>
                    <Link
                        className="text-sm font-medium text-gray-300 hover:text-green-400 hover:underline underline-offset-4"
                        href="#"
                    >
                        Features
                    </Link>
                    <Link
                        className="text-sm font-medium text-gray-300 hover:text-green-400 hover:underline underline-offset-4"
                        href="#"
                    >
                        Documentation
                    </Link>
                </nav>
            </header>

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <Card className="bg-gray-900 border-green-900/50">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-center text-gray-400">
                                Log in to your SolanaIndex account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    className="w-full border-green-700 text-white hover:bg-green-900/20 hover:border-green-500 flex items-center justify-center gap-2"
                                    onClick={handleGoogleSignIn}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="h-5 w-5 rounded-full border-2 border-t-green-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                                    ) : (
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
                                    )}
                                    Sign in with Google
                                </Button>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-green-900/50"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-gray-900 px-2 text-gray-400">Or</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-center">
                                    <Link href="/signup">
                                        <Button variant="ghost" className="text-sm text-green-400 hover:text-green-300 hover:bg-green-900/20">
                                            Need an account? Sign up
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2">
                            <p className="text-xs text-gray-400 text-center">
                                By logging in, you agree to our Terms of Service and Privacy Policy.
                            </p>
                        </CardFooter>
                    </Card>
                </div>
            </main>

            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-green-900/20 bg-black">
                <div className="container mx-auto max-w-screen-2xl flex flex-col sm:flex-row w-full justify-between items-center">
                    <p className="text-xs text-gray-500">© {new Date().getFullYear()} SolanaIndex. All rights reserved.</p>
                    <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                        <Link className="text-xs text-gray-500 hover:text-green-400 hover:underline underline-offset-4" href="#">
                            Terms of Service
                        </Link>
                        <Link className="text-xs text-gray-500 hover:text-green-400 hover:underline underline-offset-4" href="#">
                            Privacy
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}