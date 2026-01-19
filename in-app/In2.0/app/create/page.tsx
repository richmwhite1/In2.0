import { Suspense } from 'react';
import CreateEventWizard from '@/components/wizard/CreateEventWizard';
import Navigation from '@/components/Navigation';

export default function CreatePage() {
    return (
        <main className="min-h-screen pb-safe bg-background text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-purple/20 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-orange/10 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="relative z-10 p-6 pt-12 pb-32 max-w-[430px] mx-auto min-h-screen flex flex-col">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Create</h1>
                </header>

                <div className="flex-1 flex items-center">
                    <Suspense fallback={<div className="text-white/20 text-center w-full">Loading wizard...</div>}>
                        <CreateEventWizard />
                    </Suspense>
                </div>
            </div>

            <Navigation />
        </main>
    );
}
