'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Type, Sparkles, Lock, Globe, Users, Plus, X, Check, RefreshCw, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createEvent, getAISuggestions, createEventWithOptions } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import PlacesAutocomplete from './PlacesAutocomplete';

interface SuggestionOption {
    id: string;
    title: string;
    location: string;
    description: string;
    image?: string;
    flavorTag?: string;
    expertTip?: string;
}

export default function QuickCreateBento() {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    const [quickCreate, setQuickCreate] = useState<{
        activity: string;
        date: string;
        time: string;
        isDating: boolean;
        privacy: 'PRIVATE' | 'FRIENDS' | 'PUBLIC';
    }>({
        activity: '',
        date: '',
        time: '18:00',
        isDating: false,
        privacy: 'PRIVATE',
    });

    // AI Suggestions state
    const [suggestions, setSuggestions] = useState<SuggestionOption[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Manual location entry
    const [manualLocation, setManualLocation] = useState('');

    const addPlaceAsOption = (place: { placeId: string; name: string; address: string; fullAddress: string }) => {
        const newSpot: SuggestionOption = {
            id: `place-${place.placeId}`,
            title: place.name,
            location: place.fullAddress || place.address,
            description: place.address,
            flavorTag: 'Your Pick'
        };

        setSuggestions(prev => [...prev, newSpot]);
        setSelectedIds(prev => new Set(prev).add(newSpot.id)); // Auto-select added spots
        setManualLocation('');
        setShowSuggestions(true);
    };

    const addManualSpot = () => {
        if (!manualLocation.trim()) return;

        const newSpot: SuggestionOption = {
            id: `manual-${Date.now()}`,
            title: manualLocation,
            location: manualLocation,
            description: 'Custom location',
            flavorTag: 'Your Pick'
        };

        setSuggestions(prev => [...prev, newSpot]);
        setSelectedIds(prev => new Set(prev).add(newSpot.id)); // Auto-select manual spots
        setManualLocation('');
        setShowSuggestions(true);
    };

    const handleGetSuggestions = async () => {
        if (!quickCreate.activity) return;

        setIsLoadingSuggestions(true);
        setShowSuggestions(true);

        try {
            const result = await getAISuggestions(quickCreate.activity);
            if (result.success && result.options) {
                // Append to existing suggestions (for "Get More Ideas")
                setSuggestions(prev => [
                    ...prev,
                    ...result.options.map((opt: any, idx: number) => ({
                        ...opt,
                        id: opt.id || `opt-${Date.now()}-${idx}`
                    }))
                ]);
            }
        } catch (error) {
            console.error('Failed to get suggestions:', error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleQuickCreate = async () => {
        if (!quickCreate.activity || !quickCreate.date) return;

        setIsCreating(true);

        try {
            const dateTime = `${quickCreate.date}T${quickCreate.time || '18:00'}`;
            const eventType = quickCreate.isDating ? 'DATE' : 'HANGOUT';

            // Get selected options
            const selectedOptions = suggestions.filter(s => selectedIds.has(s.id));

            let result;

            if (selectedOptions.length > 0) {
                // Use createEventWithOptions for selected AI suggestions
                result = await createEventWithOptions({
                    title: quickCreate.activity,
                    date: dateTime,
                    type: eventType,
                    privacy: quickCreate.privacy,
                    selectedOptions: selectedOptions.map(opt => ({
                        title: opt.title,
                        location: opt.location,
                        description: opt.description,
                        image: opt.image,
                        flavorTag: opt.flavorTag,
                        expertTip: opt.expertTip
                    }))
                });
            } else {
                // Standard event creation without AI suggestions
                result = await createEvent({
                    title: quickCreate.activity,
                    description: `${eventType} - ${quickCreate.activity}`,
                    date: dateTime,
                    location: 'TBD',
                    type: eventType,
                    withSuggestions: false,
                    privacy: quickCreate.privacy,
                });
            }

            if (result.success && result.event) {
                router.push(`/mood/${result.event.id}?type=${eventType}`);
            } else {
                console.error('Failed to create:', result.error);
            }
        } catch (error) {
            console.error('Failed to create:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const selectedCount = selectedIds.size;

    return (
        <div className="px-6 mb-6">
            <AnimatePresence mode="wait">
                {!isExpanded ? (
                    // Collapsed State
                    <motion.button
                        key="collapsed"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onClick={() => setIsExpanded(true)}
                        className="w-full py-4 rounded-elite glass border border-white/10 flex items-center justify-center gap-3 text-white font-bold hover:border-white/20 transition-all hover:scale-[1.01]"
                    >
                        <Plus size={20} />
                        Create Hangout
                    </motion.button>
                ) : (
                    // Expanded State
                    <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="relative glass p-6 rounded-elite border border-white/10 space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-white font-bold text-lg">What&apos;s the move?</h2>
                            <button
                                onClick={() => {
                                    setIsExpanded(false);
                                    setSuggestions([]);
                                    setSelectedIds(new Set());
                                    setShowSuggestions(false);
                                }}
                                className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X size={16} className="text-white/60" />
                            </button>
                        </div>

                        {/* Hangout/Date Toggle */}
                        <div className="flex bg-white/5 rounded-xl p-1">
                            <button
                                type="button"
                                onClick={() => setQuickCreate({ ...quickCreate, isDating: false })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${!quickCreate.isDating ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                            >
                                Hangout
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickCreate({ ...quickCreate, isDating: true })}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${quickCreate.isDating ? 'bg-pink-500 text-white' : 'text-white/40 hover:text-white'}`}
                            >
                                Date
                            </button>
                        </div>

                        {/* Activity Input */}
                        <div className="relative">
                            <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                            <input
                                type="text"
                                placeholder={quickCreate.isDating ? "e.g., Cocktails, Dinner" : "e.g., Hiking, Tacos, Golf"}
                                value={quickCreate.activity}
                                onChange={(e) => {
                                    setQuickCreate({ ...quickCreate, activity: e.target.value });
                                    // Reset suggestions when activity changes
                                    if (suggestions.length > 0) {
                                        setSuggestions([]);
                                        setSelectedIds(new Set());
                                    }
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                            />
                        </div>

                        {/* Date & Time Row */}
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="date"
                                    value={quickCreate.date}
                                    onChange={(e) => setQuickCreate({ ...quickCreate, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div className="relative w-32">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                                <input
                                    type="time"
                                    value={quickCreate.time}
                                    onChange={(e) => setQuickCreate({ ...quickCreate, time: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-2 text-white focus:outline-none focus:border-purple-500/50"
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                        </div>

                        {/* Location Input - Google Places Autocomplete */}
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <PlacesAutocomplete
                                    value={manualLocation}
                                    onChange={setManualLocation}
                                    onSelect={addPlaceAsOption}
                                    placeholder="Search for a place..."
                                />
                            </div>
                            <button
                                type="button"
                                onClick={addManualSpot}
                                disabled={!manualLocation.trim()}
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${manualLocation.trim()
                                        ? 'bg-white text-black hover:scale-105'
                                        : 'bg-white/10 text-white/30 border border-white/10'
                                    }`}
                                title="Add as custom location"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        {/* AI Suggestions Button */}
                        {!showSuggestions && (
                            <button
                                type="button"
                                onClick={handleGetSuggestions}
                                disabled={!quickCreate.activity || isLoadingSuggestions}
                                className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl border transition-all ${quickCreate.activity
                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30'
                                    : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                                    }`}
                            >
                                <Sparkles size={18} />
                                <span className="font-bold">Ask AI for suggestions</span>
                            </button>
                        )}

                        {/* AI Suggestions Results */}
                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-white/60 text-sm font-bold">
                                            {selectedCount === 0 ? 'Select options' : `${selectedCount} selected`}
                                            {selectedCount > 1 && ' (creates poll)'}
                                        </span>
                                    </div>

                                    {/* Loading State */}
                                    {isLoadingSuggestions && suggestions.length === 0 && (
                                        <div className="flex items-center justify-center py-8">
                                            <RefreshCw className="animate-spin text-purple-400" size={24} />
                                            <span className="ml-3 text-white/60">Finding great spots...</span>
                                        </div>
                                    )}

                                    {/* Suggestion Cards */}
                                    {suggestions.map((opt, idx) => (
                                        <motion.div
                                            key={opt.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <GlassCard
                                                onClick={() => toggleSelection(opt.id)}
                                                className={`p-4 cursor-pointer transition-all ${selectedIds.has(opt.id)
                                                    ? 'ring-2 ring-purple-500 bg-purple-500/10'
                                                    : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex gap-3">
                                                    {/* Selection Indicator */}
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedIds.has(opt.id)
                                                        ? 'bg-purple-500 border-purple-500'
                                                        : 'border-white/30'
                                                        }`}>
                                                        {selectedIds.has(opt.id) && <Check size={14} className="text-white" />}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="text-white font-bold">{opt.title}</h4>
                                                            {opt.flavorTag && (
                                                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/60 text-[10px] font-bold uppercase">
                                                                    {opt.flavorTag}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-white/50 text-sm flex items-center gap-1 mt-1">
                                                            <MapPin size={12} />
                                                            {opt.location}
                                                        </p>
                                                        <p className="text-white/40 text-xs mt-1">{opt.description}</p>
                                                        {opt.expertTip && (
                                                            <p className="text-purple-300/60 text-xs mt-2 italic">💡 {opt.expertTip}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </GlassCard>
                                        </motion.div>
                                    ))}

                                    {/* Get More Ideas Button */}
                                    <button
                                        type="button"
                                        onClick={handleGetSuggestions}
                                        disabled={isLoadingSuggestions}
                                        className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/60 font-bold text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoadingSuggestions ? (
                                            <RefreshCw className="animate-spin" size={16} />
                                        ) : (
                                            <Plus size={16} />
                                        )}
                                        Get More Ideas
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Privacy Selector */}
                        <div className="flex gap-2">
                            {(['PRIVATE', 'FRIENDS', 'PUBLIC'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setQuickCreate({ ...quickCreate, privacy: mode })}
                                    className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all
                                        ${quickCreate.privacy === mode
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                >
                                    {mode === 'PRIVATE' && <Lock size={10} />}
                                    {mode === 'FRIENDS' && <Users size={10} />}
                                    {mode === 'PUBLIC' && <Globe size={10} />}
                                    {mode}
                                </button>
                            ))}
                        </div>

                        {/* Create Button */}
                        <button
                            type="button"
                            onClick={handleQuickCreate}
                            disabled={!quickCreate.activity || !quickCreate.date || isCreating}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${quickCreate.activity && quickCreate.date
                                ? 'bg-gradient-to-r from-white to-gray-200 text-black shadow-lg hover:scale-[1.02]'
                                : 'bg-white/5 text-white/20 cursor-not-allowed'
                                }`}
                        >
                            {isCreating ? 'Creating...' : (
                                selectedCount > 1
                                    ? `Create Poll (${selectedCount} options)`
                                    : `Create ${quickCreate.isDating ? 'Date' : 'Hangout'}`
                            )}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
