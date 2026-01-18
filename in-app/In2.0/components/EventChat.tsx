'use client';

import { useState, useRef, useEffect } from 'react';
import { postComment } from '@/lib/actions';
import { User } from '@/lib/types';

interface Comment {
    id: string;
    message: string;
    author: string;
    avatar?: string;
    createdAt: Date;
}

interface EventChatProps {
    eventId: string;
    initialComments?: Comment[];
    currentUser: User; // For attributing messages
}

export default function EventChat({ eventId, initialComments = [], currentUser }: EventChatProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [comments]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);

        // Optimistic update
        const tempId = Date.now().toString();
        const optimisticComment: Comment = {
            id: tempId,
            message: newMessage,
            author: currentUser.name,
            avatar: currentUser.avatar,
            createdAt: new Date(),
        };

        setComments((prev) => [...prev, optimisticComment]);
        setNewMessage('');

        try {
            const result = await postComment(eventId, optimisticComment.message, {
                name: currentUser.name,
                userId: currentUser.id,
                avatar: currentUser.avatar
            });

            if (!result.success) {
                // Revert if failed (simplified)
                setComments((prev) => prev.filter((c) => c.id !== tempId));
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setComments((prev) => prev.filter((c) => c.id !== tempId));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col h-[300px] glass rounded-3xl overflow-hidden border border-white/10">
            <div className="bg-white/5 p-4 border-b border-white/5">
                <h3 className="font-bold text-white text-sm">Event Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {comments.length === 0 ? (
                    <div className="text-center text-white/40 text-xs py-10">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className={`flex gap-3 animate-fade-in-up ${comment.author === currentUser.name ? 'flex-row-reverse' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden flex-shrink-0">
                                {comment.avatar ? (
                                    <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                        {comment.author[0]}
                                    </div>
                                )}
                            </div>
                            <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${comment.author === currentUser.name
                                ? 'bg-accent-purple text-white rounded-tr-sm'
                                : 'bg-white/10 text-white rounded-tl-sm'
                                }`}>
                                <p>{comment.message}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-purple/50"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                    ➤
                </button>
            </form>
        </div>
    );
}
