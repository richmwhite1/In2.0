'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Plus, Users, User } from 'lucide-react';

export default function Navigation() {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { id: 'home', label: 'Home', icon: Home, path: '/' },
        { id: 'friends', label: 'Friends', icon: Users, path: '/friends' },
        { id: 'create', label: 'Create', icon: Plus, path: '/create', special: true },
        { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/calendar' },
        { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            <div className="mx-auto max-w-[430px] p-6">
                <div className="glass-nav px-2 py-3 rounded-elite pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/50">
                    <div className="flex justify-between items-center px-4">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => router.push(item.path)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${isActive(item.path) ? 'text-white' : 'text-white/50'
                                        } ${item.special
                                            ? 'bg-gradient-to-r from-orange-500 to-purple-500 text-white -mt-8 w-14 h-14 shadow-lg ring-4 ring-black'
                                            : ''
                                        }`}
                                >
                                    <Icon size={item.special ? 24 : 20} />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </nav>
    );
}
