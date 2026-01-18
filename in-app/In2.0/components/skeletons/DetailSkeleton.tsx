export default function DetailSkeleton() {
    return (
        <div className="min-h-screen bg-background pb-32 animate-pulse">
            {/* Hero Skeleton */}
            <div className="h-[40vh] bg-white/5 relative" />

            <div className="px-6 -mt-10 relative z-10 space-y-6">
                {/* Title Skeleton */}
                <div className="space-y-2">
                    <div className="h-8 w-3/4 bg-white/10 rounded-lg" />
                    <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                </div>

                {/* RSVP Toggle Skeleton */}
                <div className="h-12 w-full bg-white/5 rounded-full" />

                {/* Attendees Skeleton */}
                <div className="h-20 w-full bg-white/5 rounded-2xl" />

                {/* Chat Skeleton */}
                <div className="h-[300px] w-full bg-white/5 rounded-3xl" />
            </div>
        </div>
    );
}
