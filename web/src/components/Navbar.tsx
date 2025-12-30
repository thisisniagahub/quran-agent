import Link from 'next/link';
import Image from 'next/image';
import { Network } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 px-6 py-4">
            <div className="max-w-7xl mx-auto backdrop-blur-md bg-bg-ocean/30 border border-pulse-deep/20 rounded-2xl flex items-center justify-between px-6 py-3 shadow-[0_0_15px_rgba(0,240,255,0.1)]">

                {/* Logo Section */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                        <Image
                            src="/logo.png"
                            alt="Quran Pulse Logo"
                            fill
                            sizes="48px"
                            className="object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                        />
                    </div>
                </Link>

                {/* Connect Button */}
                <button className="flex items-center gap-2 bg-pulse-deep/20 hover:bg-pulse-glow/10 border border-pulse-glow/50 text-pulse-glow px-5 py-2 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] group">
                    <Network className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    <span className="text-sm font-medium">Connect Agent</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
