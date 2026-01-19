import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "In. Social Coordinator",
    description: "Discover and coordinate events with friends in 2-3 taps",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "In.",
    },
    openGraph: {
        title: "In. Social Coordinator",
        description: "Pick your favorite spot & let's make it happen.",
        url: "https://in-social.app",
        siteName: "In.",
        images: [
            {
                url: "/og-image-social.png",
                width: 1200,
                height: 630,
                alt: "In. Social Coordinator Branding",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "In. Social Coordinator",
        description: "Coordinate hangouts effortlessly.",
        images: ["/og-image-social.png"],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#0A0A0A",
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <div className="mobile-container pb-safe">
                    {children}
                </div>
            </body>
        </html>
    );
}
