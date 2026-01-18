'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AnalyticsBento from '@/components/admin/AnalyticsBento';
import PartnerTable from '@/components/admin/PartnerTable';
import { Shield } from 'lucide-react';

export default function AdminMonetizationPage() {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for admin secret
        const secret = prompt('Enter admin secret:');

        if (secret === process.env.NEXT_PUBLIC_ADMIN_SECRET || secret === 'demo-admin-2026') {
            setIsAuthorized(true);
        } else {
            alert('Unauthorized access');
            router.push('/');
        }

        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-white/60">Loading...</div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <main className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="px-6 pt-safe pb-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                        <Shield size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
                        <p className="text-white/60 text-sm">Monetization & Partner Management</p>
                    </div>
                </div>
            </div>

            <div className="px-6 py-8">
                {/* Analytics */}
                <AnalyticsBento />

                {/* Partner Management */}
                <PartnerTable />
            </div>
        </main>
    );
}
