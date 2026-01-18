'use client';

import { User } from '@/lib/types';

interface AvatarStackProps {
    users: User[];
    max?: number;
    size?: 'sm' | 'md' | 'lg';
}

export default function AvatarStack({ users, max = 3, size = 'md' }: AvatarStackProps) {
    const displayUsers = users.slice(0, max);
    const remainingCount = users.length - max;

    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10',
    };

    return (
        <div className="flex items-center -space-x-2">
            {displayUsers.map((user, index) => (
                <div
                    key={user.id}
                    className={`${sizeClasses[size]} rounded-full border-2 border-background overflow-hidden relative`}
                    style={{ zIndex: displayUsers.length - index }}
                >
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            ))}
            {remainingCount > 0 && (
                <div
                    className={`${sizeClasses[size]} rounded-full border-2 border-background bg-card flex items-center justify-center text-xs font-semibold text-white/60`}
                    style={{ zIndex: 0 }}
                >
                    +{remainingCount}
                </div>
            )}
        </div>
    );
}
