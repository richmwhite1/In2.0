'use client';

import { useState, useEffect } from 'react';
import { getPartners, createPartner, updatePartner, deletePartner } from '@/lib/actions';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PartnerTable() {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'restaurant',
        zipCode: '',
        affiliateUrl: '',
        priority: 5
    });

    useEffect(() => {
        loadPartners();
    }, []);

    async function loadPartners() {
        setLoading(true);
        const data = await getPartners();
        setPartners(data);
        setLoading(false);
    }

    function openModal(partner?: any) {
        if (partner) {
            setEditingPartner(partner);
            setFormData({
                name: partner.name,
                category: partner.category,
                zipCode: partner.zipCode,
                affiliateUrl: partner.affiliateUrl,
                priority: partner.priority
            });
        } else {
            setEditingPartner(null);
            setFormData({
                name: '',
                category: 'restaurant',
                zipCode: '',
                affiliateUrl: '',
                priority: 5
            });
        }
        setShowModal(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editingPartner) {
            await updatePartner(editingPartner.id, formData);
        } else {
            await createPartner(formData);
        }

        setShowModal(false);
        loadPartners();
    }

    async function handleDelete(id: string) {
        if (confirm('Are you sure you want to delete this partner?')) {
            await deletePartner(id);
            loadPartners();
        }
    }

    const categories = ['restaurant', 'bar', 'activity', 'entertainment'];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">Partner Venues</h2>
                <button
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-white text-black rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all"
                >
                    <Plus size={18} />
                    Add Partner
                </button>
            </div>

            <div className="rounded-[32px] glass overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left p-4 text-white/60 font-bold text-sm">Name</th>
                                <th className="text-left p-4 text-white/60 font-bold text-sm">Category</th>
                                <th className="text-left p-4 text-white/60 font-bold text-sm">Zip Code</th>
                                <th className="text-left p-4 text-white/60 font-bold text-sm">Priority</th>
                                <th className="text-left p-4 text-white/60 font-bold text-sm">Clicks</th>
                                <th className="text-left p-4 text-white/60 font-bold text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-white/40">
                                        Loading...
                                    </td>
                                </tr>
                            ) : partners.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-white/40">
                                        No partners yet. Add your first one!
                                    </td>
                                </tr>
                            ) : (
                                partners.map(partner => (
                                    <tr key={partner.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">{partner.name}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-lg bg-white/10 text-white/80 text-xs font-bold capitalize">
                                                {partner.category}
                                            </span>
                                        </td>
                                        <td className="p-4 text-white/80">{partner.zipCode}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500"
                                                        style={{ width: `${partner.priority * 10}%` }}
                                                    />
                                                </div>
                                                <span className="text-white/60 text-sm font-bold">{partner.priority}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-white/80 font-bold">{partner.clickCount || 0}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openModal(partner)}
                                                    className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(partner.id)}
                                                    className="p-2 rounded-xl bg-white/10 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md rounded-[32px] glass p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white">
                                    {editingPartner ? 'Edit Partner' : 'Add Partner'}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-white/60 text-sm font-bold mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        placeholder="The Rooftop Bar"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm font-bold mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white focus:border-white/30 focus:outline-none"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat} className="bg-black">
                                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm font-bold mb-2">Zip Code</label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        placeholder="90210"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm font-bold mb-2">Affiliate URL</label>
                                    <input
                                        type="url"
                                        value={formData.affiliateUrl}
                                        onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                                        className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-white/40 focus:border-white/30 focus:outline-none"
                                        placeholder="https://partner.com/book?ref=..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/60 text-sm font-bold mb-2">
                                        Priority Score: {formData.priority}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between text-xs text-white/40 mt-1">
                                        <span>Low</span>
                                        <span>High</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 bg-white text-black rounded-2xl font-black hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    <Check size={18} />
                                    {editingPartner ? 'Update Partner' : 'Create Partner'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
