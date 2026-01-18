'use client';

import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';

export default function ProfilePage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-background pb-32">
            <div className="max-w-2xl mx-auto px-6 pt-safe">
                {/* Header */}
                <div className="pt-8 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="mb-6 p-2 rounded-xl glass hover:bg-white/10 transition-all"
                    >
                        ← Back
                    </button>
                    <h1 className="text-white font-black text-3xl mb-2">Profile</h1>
                    <p className="text-white/60">Manage your account and preferences</p>
                </div>

                {/* Profile Card */}
                <GlassCard className="p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                        <div>
                            <h2 className="text-white font-bold text-xl">Guest User</h2>
                            <p className="text-white/60 text-sm">guest@example.com</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Settings */}
                <div className="space-y-3">
                    <GlassCard className="p-4">
                        <button className="w-full text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-white font-medium">Notifications</span>
                                <span className="text-white/40">→</span>
                            </div>
                        </button>
                    </GlassCard>

                    <GlassCard className="p-4">
                        <button className="w-full text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-white font-medium">Privacy</span>
                                <span className="text-white/40">→</span>
                            </div>
                        </button>
                    </GlassCard>

                    <GlassCard className="p-4">
                        <button className="w-full text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-white font-medium">About</span>
                                <span className="text-white/40">→</span>
                            </div>
                        </button>
                    </GlassCard>
                </div>
            </div>
        </main>
    );
}
