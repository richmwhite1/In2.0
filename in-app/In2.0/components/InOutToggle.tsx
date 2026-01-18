'use client';



interface InOutToggleProps {
    status: 'in' | 'out' | null;
    onToggle: (status: 'in' | 'out') => void;
}

export default function InOutToggle({ status, onToggle }: InOutToggleProps) {
    return (
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
            <button
                onClick={() => onToggle('in')}
                className={`flex-1 py-2 px-6 rounded-full font-bold text-sm transition-all duration-300 ${status === 'in'
                    ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                    : 'bg-transparent text-white/60 hover:text-white'
                    }`}
            >
                I&apos;m In
            </button>
            <button
                onClick={() => onToggle('out')}
                className={`flex-1 py-2 px-6 rounded-full font-bold text-sm transition-all duration-300 ${status === 'out'
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                    : 'bg-transparent text-white/60 hover:text-white'
                    }`}
            >
                I&apos;m Out
            </button>
        </div>
    );
}
