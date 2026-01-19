'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface PlaceResult {
    placeId: string;
    name: string;
    address: string;
    fullAddress: string;
}

interface PlacesAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (place: PlaceResult) => void;
    placeholder?: string;
    className?: string;
}

export default function PlacesAutocomplete({
    value,
    onChange,
    onSelect,
    placeholder = "Search for a place...",
    className = ""
}: PlacesAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node) &&
                !inputRef.current?.contains(e.target as Node)
            ) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions from Google Places API
    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);

        try {
            // Use Google Places Autocomplete via client-side API
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                console.error('Google Maps API key not found');
                setIsLoading(false);
                return;
            }

            // Call Places Autocomplete API
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&types=establishment|geocode&key=${apiKey}`,
                { mode: 'no-cors' } // Note: This won't work in browser due to CORS
            );

            // Since direct API calls have CORS issues, we'll use the Google Maps JavaScript API
            // Load Google Places library if not already loaded
            if (!window.google?.maps?.places) {
                await loadGoogleMapsScript(apiKey);
            }

            const service = new window.google.maps.places.AutocompleteService();

            service.getPlacePredictions(
                { input: query, types: ['establishment', 'geocode'] },
                (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
                    setIsLoading(false);
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setSuggestions(
                            predictions.slice(0, 5).map((p) => ({
                                placeId: p.place_id,
                                name: p.structured_formatting?.main_text || p.description.split(',')[0],
                                address: p.structured_formatting?.secondary_text || '',
                                fullAddress: p.description
                            }))
                        );
                        setShowDropdown(true);
                    } else {
                        setSuggestions([]);
                    }
                }
            );
        } catch (error) {
            console.error('Places API error:', error);
            setIsLoading(false);
            setSuggestions([]);
        }
    };

    // Load Google Maps script dynamically
    const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (window.google?.maps?.places) {
                resolve();
                return;
            }

            // Check if script is already loading
            const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
            if (existingScript) {
                existingScript.addEventListener('load', () => resolve());
                return;
            }

            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Maps'));
            document.head.appendChild(script);
        });
    };

    // Debounced input handler
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setActiveIndex(-1);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchSuggestions(newValue);
        }, 300);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && suggestions[activeIndex]) {
                    handleSelect(suggestions[activeIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                break;
        }
    };

    const handleSelect = (place: PlaceResult) => {
        onChange(place.name);
        onSelect(place);
        setShowDropdown(false);
        setSuggestions([]);
    };

    return (
        <div className={`relative ${className}`}>
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10" size={18} />
            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50"
                autoComplete="off"
            />

            {isLoading && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 animate-spin" size={16} />
            )}

            {/* Suggestions Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-2 bg-charcoal/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
                >
                    {suggestions.map((place, idx) => (
                        <button
                            key={place.placeId}
                            type="button"
                            onClick={() => handleSelect(place)}
                            className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${activeIndex === idx ? 'bg-white/10' : 'hover:bg-white/5'
                                }`}
                        >
                            <MapPin size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-white font-medium truncate">{place.name}</p>
                                <p className="text-white/40 text-sm truncate">{place.address}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// Extend Window interface for Google Maps
declare global {
    interface Window {
        google: any;
    }
}
