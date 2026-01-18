'use client';

import { useEffect, useState } from 'react';
import { getPartnerAnalytics } from '@/lib/actions';
import { TrendingUp, MousePointerClick, Heart } from 'lucide-react';

export default function AnalyticsBento() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalytics() {
            const data = await getPartnerAnalytics();
            setAnalytics(data);
            setLoading(false);
        }
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-6 rounded-[32px] glass animate-pulse">
                        <div className="h-20 bg-white/5 rounded-xl" />
                    </div>
                ))}
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Clicks',
            value: analytics?.totalClicks || 0,
            icon: MousePointerClick,
            gradient: 'from-blue-500 to-cyan-500'
        },
        {
            label: 'Top Performing Mood',
            value: analytics?.topMood || 'N/A',
            icon: Heart,
            gradient: 'from-pink-500 to-purple-500'
        },
        {
            label: 'Active Partners',
            value: analytics?.partnerPerformance?.length || 0,
            icon: TrendingUp,
            gradient: 'from-orange-500 to-yellow-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, idx) => (
                <div
                    key={idx}
                    className="p-6 rounded-[32px] glass hover:scale-[1.02] transition-all duration-300"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                            <stat.icon size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white mb-1">
                        {stat.value}
                    </div>
                    <div className="text-sm text-white/60 font-medium">
                        {stat.label}
                    </div>
                </div>
            ))}
        </div>
    );
}
