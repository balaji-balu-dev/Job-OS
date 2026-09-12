"use client";

import React, { useState } from 'react';
import { ArrowUpRight, Play, Menu, X, Sparkles } from 'lucide-react';

export interface NavLink {
    label: string;
    href: string;
    isActive?: boolean;
}

export interface Partner {
    logoUrl: string;
    href: string;
    name?: string;
}

export interface ResponsiveHeroBannerProps {
    logoUrl?: string;
    backgroundImageUrl?: string;
    navLinks?: NavLink[];
    ctaButtonText?: string;
    ctaButtonHref?: string;
    badgeText?: string;
    badgeLabel?: string;
    title?: string;
    titleLine2?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonHref?: string;
    secondaryButtonText?: string;
    secondaryButtonHref?: string;
    partnersTitle?: string;
    partners?: Partner[];
}

export const ResponsiveHeroBanner: React.FC<ResponsiveHeroBannerProps> = ({
    logoUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    backgroundImageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=85",
    navLinks = [
        { label: "Home", href: "#", isActive: true },
        { label: "Missions", href: "#" },
        { label: "Destinations", href: "#" },
        { label: "Technology", href: "#" },
        { label: "Book Flight", href: "#" }
    ],
    ctaButtonText = "Reserve Seat",
    ctaButtonHref = "#",
    badgeLabel = "New",
    badgeText = "First Commercial Flight to Mars 2026",
    title = "Journey Beyond Earth",
    titleLine2 = "Into the Cosmos",
    description = "Experience the cosmos like never before. Our advanced spacecraft and cutting-edge technology make interplanetary travel accessible, safe, and unforgettable.",
    primaryButtonText = "Book Your Journey",
    primaryButtonHref = "#",
    secondaryButtonText = "Watch Launch",
    secondaryButtonHref = "#",
    partnersTitle = "Partnering with leading space agencies worldwide",
    partners = [
        { logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=240&q=80", href: "#", name: "NASA JPL" },
        { logoUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=240&q=80", href: "#", name: "ESA" },
        { logoUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=240&q=80", href: "#", name: "ISRO" },
        { logoUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=240&q=80", href: "#", name: "JAXA" },
        { logoUrl: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=240&q=80", href: "#", name: "SpaceX" }
    ]
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <section className="w-full isolate min-h-screen overflow-hidden relative bg-neutral-950 text-white font-sans selection:bg-white selection:text-neutral-900">
            {/* Background Image with Dark Vignette Overlay */}
            <img
                src={backgroundImageUrl}
                alt="Hero Background"
                className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0 -z-10 brightness-[0.45] contrast-[1.1] scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-neutral-950/90" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />

            {/* Navigation Header */}
            <header className="z-20 relative pt-4">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        {/* Brand Logo */}
                        <a
                            href="#"
                            className="inline-flex items-center gap-2 text-white font-bold tracking-wider text-lg uppercase"
                        >
                            <span className="w-9 h-9 rounded-lg bg-white/10 ring-1 ring-white/20 backdrop-blur flex items-center justify-center text-white">
                                <Sparkles className="w-5 h-5 text-white/90" />
                            </span>
                            <span className="font-sans font-extrabold tracking-tight text-white">COSMOS<span className="text-white/40">.AI</span></span>
                        </a>

                        {/* Desktop Blurred Pill Navigation Bar */}
                        <nav className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 ring-1 ring-white/10 backdrop-blur-md shadow-2xl">
                                {navLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className={`px-3.5 py-1.5 text-sm font-medium hover:text-white rounded-full transition-all duration-200 ${
                                            link.isActive 
                                                ? 'text-white bg-white/10 shadow-sm' 
                                                : 'text-white/70 hover:bg-white/5'
                                        }`}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    href={ctaButtonHref}
                                    className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
                                >
                                    {ctaButtonText}
                                    <ArrowUpRight className="h-4 w-4" />
                                </a>
                            </div>
                        </nav>

                        {/* Mobile Hamburger Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-white hover:bg-white/20 transition-colors"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                    {/* Mobile Navigation Drawer */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 p-4 rounded-2xl bg-neutral-900/90 ring-1 ring-white/15 backdrop-blur-xl flex flex-col gap-2 animate-fade-slide-in-1">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        link.isActive ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5'
                                    }`}
                                >
                                    {link.label}
                                </a>
                            ))}
                            <a
                                href={ctaButtonHref}
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-neutral-950 hover:bg-neutral-100 transition-colors"
                            >
                                {ctaButtonText}
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </div>
                    )}
                </div>
            </header>

            {/* Hero Main Body */}
            <div className="z-10 relative">
                <div className="sm:pt-24 md:pt-28 lg:pt-32 max-w-7xl mx-auto pt-20 px-6 pb-20">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Status Badge */}
                        <div className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md animate-fade-slide-in-1 hover:ring-white/30 transition-all cursor-default">
                            <span className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-950 bg-white rounded-full py-0.5 px-2.5">
                                {badgeLabel}
                            </span>
                            <span className="text-sm font-medium text-white/90">
                                {badgeText}
                            </span>
                        </div>

                        {/* Hero Headline */}
                        <h1 className="sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] text-5xl text-white tracking-tight font-serif font-normal animate-fade-slide-in-2 drop-shadow-2xl">
                            {title}
                            <br className="hidden sm:block" />
                            <span className="italic opacity-90">{titleLine2}</span>
                        </h1>

                        {/* Description Subtext */}
                        <p className="sm:text-xl animate-fade-slide-in-3 text-base text-white/80 max-w-2xl mt-6 mx-auto leading-relaxed">
                            {description}
                        </p>

                        {/* Call To Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center animate-fade-slide-in-4">
                            <a
                                href={primaryButtonHref}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm font-semibold text-neutral-950 bg-white hover:bg-neutral-100 hover:scale-[1.03] active:scale-[0.98] ring-1 ring-white/20 rounded-full py-3.5 px-7 transition-all shadow-2xl"
                            >
                                {primaryButtonText}
                                <ArrowUpRight className="h-4 w-4" />
                            </a>
                            <a
                                href={secondaryButtonHref}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 backdrop-blur-md px-6 py-3.5 text-sm font-medium text-white hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Play className="w-4 h-4 fill-white" />
                                {secondaryButtonText}
                            </a>
                        </div>
                    </div>

                    {/* Partners & Affiliates Section */}
                    <div className="mx-auto mt-24 max-w-5xl">
                        <p className="animate-fade-slide-in-1 text-xs uppercase tracking-widest text-white/50 text-center font-medium">
                            {partnersTitle}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 animate-fade-slide-in-2 text-white/70 mt-6 items-center justify-items-center gap-4">
                            {partners.map((partner, index) => (
                                <a
                                    key={index}
                                    href={partner.href}
                                    title={partner.name || `Partner ${index + 1}`}
                                    className="inline-flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 rounded-full text-xs font-semibold tracking-wider text-white/80 hover:text-white transition-all backdrop-blur"
                                >
                                    {partner.name || `AGENCY ${index + 1}`}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResponsiveHeroBanner;
