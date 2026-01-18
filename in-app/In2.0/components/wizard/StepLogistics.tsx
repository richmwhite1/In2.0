'use client';

interface StepLogisticsProps {
    date: string;
    location: string;
    onDateChange: (value: string) => void;
    onLocationChange: (value: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function StepLogistics({
    date,
    location,
    onDateChange,
    onLocationChange,
    onNext,
    onBack
}: StepLogisticsProps) {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">When & Where?</h2>
                <p className="text-white/60 text-sm">Set the scene for your guests.</p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Date & Time</label>
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-accent-purple/50 transition-colors"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => onLocationChange(e.target.value)}
                        placeholder="Search for a venue..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/40 focus:outline-none focus:border-accent-purple/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="flex-1 py-4 rounded-full font-bold text-lg bg-white/5 text-white hover:bg-white/10 transition-all duration-300"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!date || !location}
                    className={`flex-1 py-4 rounded-full font-bold text-lg transition-all duration-300 ${date && location
                            ? 'bg-gradient-to-r from-accent-orange to-accent-purple text-white shadow-lg shadow-purple-900/20'
                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                        }`}
                >
                    Review
                </button>
            </div>
        </div>
    );
}
