"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

const navLinks = [
  { name: "HOME", href: "/" },
  { name: "WORK", href: "/work" },
  { name: "LAB", href: "/lab" },
  { name: "ABOUT", href: "/about" },
  { name: "CONTACT", href: "/contact" },
];

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (navRef.current) {
      gsap.fromTo(
        navRef.current,
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.5, ease: "expo.out", delay: 2.3 }
      );
    }
  }, []);

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      ref={navRef}
      className="fixed top-0 left-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-[#800000]/30 mix-blend-difference text-white opacity-0"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between h-20">
        {/* Logo */}
        <Link href="/" className="font-mono tracking-widest text-lg font-bold group">
          <span className="text-[#FF0000]">&lt;</span>
          <span className="group-hover:text-[#FF0000] transition-colors duration-300">SYSTEM</span>
          <span className="text-[#800000]">/&gt;</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="font-mono text-sm tracking-[0.2em] hover:text-[#FF0000] transition-colors duration-300 relative group"
            >
              {link.name}
              <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-[#FF0000] transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex flex-col items-end justify-center w-8 h-8 space-y-1.5 focus:outline-none group z-50"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-[1px] bg-white transition-all duration-300 ease-out ${
              isMobileMenuOpen ? "w-6 transform rotate-45 translate-y-[7px]" : "w-8 group-hover:w-6 group-hover:bg-[#FF0000]"
            }`}
          />
          <span
            className={`block h-[1px] w-6 bg-white transition-all duration-300 ease-out ${
              isMobileMenuOpen ? "opacity-0" : "group-hover:w-8 group-hover:bg-[#FF0000]"
            }`}
          />
          <span
            className={`block h-[1px] bg-white transition-all duration-300 ease-out ${
              isMobileMenuOpen ? "w-6 transform -rotate-45 -translate-y-[7px]" : "w-4 group-hover:w-8 group-hover:bg-[#FF0000]"
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-[#800000]/50 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col items-center py-8 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="font-mono text-sm tracking-[0.3em] hover:text-[#FF0000] transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
