'use client';

import { useState } from 'react';
import { parseUrlAction, parseTextAction } from '@/app/actions/mood';

export default function MoodTestPage() {
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'url' | 'text'>('url');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            let response;
            if (mode === 'url') {
                response = await parseUrlAction(url);
            } else {
                response = await parseTextAction(text);
            }
            setResult(response);
        } catch (err) {
            setResult({ success: false, error: 'Client error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8 text-white bg-black font-sans">
            <h1 className="text-3xl font-bold mb-2">Mood Agent Test</h1>
            <p className="text-white/60 mb-8">Test the Gemini 1.5 Flash integration for event parsing.</p>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setMode('url')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${mode === 'url' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    URL Parse
                </button>
                <button
                    onClick={() => setMode('text')}
                    className={`px-4 py-2 rounded-full font-medium transition-all ${mode === 'text' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                    Text Parse
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
                {mode === 'url' ? (
                    <div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Paste event URL here (e.g., Resident Advisor, Eventbrite)..."
                            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all"
                            required
                        />
                    </div>
                ) : (
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste event description here..."
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all h-32"
                        required
                    />
                )}

                <button
                    type="submit"
                    disabled={loading || (mode === 'url' ? !url : !text)}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-white shadow-lg shadow-purple-900/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                >
                    {loading ? 'Analyzing...' : 'Analyze Mood'}
                </button>
            </form>

            {result && (
                <div className="mt-8 max-w-2xl">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        {result.success ? '✅ Success' : '❌ Error'}
                    </h2>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 overflow-auto max-h-[600px]">
                        <pre className="text-sm font-mono whitespace-pre-wrap text-white/80">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>

                    {result.success && result.data && (
                        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10">
                            <h3 className="text-lg font-bold mb-4 text-white/50 uppercase tracking-wider text-xs">Visual Review</h3>
                            <h2 className="text-2xl font-bold mb-2">{result.data.title}</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {result.data.mood_tags?.map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-purple-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <p className="text-white/80 mb-4">{result.data.description_summary}</p>
                            <div className="flex items-center gap-2 text-sm text-white/60">
                                <span>📍 {result.data.location_name}</span>
                                {result.data.suggested_time && <span>🕒 {result.data.suggested_time}</span>}
                            </div>
                            <div className="mt-4 p-4 bg-white/5 rounded-lg">
                                <p className="text-xs text-white/40 mb-1">IMAGE PROMPT</p>
                                <p className="text-sm italic text-white/70">{result.data.image_suggestion}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
