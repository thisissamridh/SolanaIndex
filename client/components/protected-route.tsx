
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {

        if (!loading) {
            if (!user) {

                router.push('/login');
            } else {

                setShouldRender(true);
            }
        }
    }, [user, loading, router]);


    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-12 w-12 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
        );
    }


    if (!shouldRender) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black">
                <div className="h-12 w-12 rounded-full border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
        );
    }


    return <>{children}</>;
}