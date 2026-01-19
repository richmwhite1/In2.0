'use client';

import { Copy, Check, Share2 } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../GlassCard';

interface InviteLinkProps {
    inviteUrl: string;
}

export default function InviteLink({ inviteUrl }: InviteLinkProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <Share2 size={18} className="text-purple-400" />
                <h3 className="text-white font-bold">Invite Friends</h3>
            </div>
            <p className="text-white/40 text-sm mb-4">Share this link to invite friends to join you on In.</p>
            <div className="flex items-center gap-3">
                <div className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-sm font-medium text-white/60 truncate">
                    {inviteUrl}
                </div>
                <button
                    onClick={copyToClipboard}
                    className={`p-3 rounded-2xl transition-all duration-300 flex items-center justify-center ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white text-black hover:scale-105'
                        }`}
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
            </div>
            <p className="text-[10px] mt-4 text-white/30 text-center uppercase tracking-widest font-bold">
                {copied ? '✓ Link copied!' : 'Tap to copy invite link'}
            </p>
        </GlassCard>
    );
}
