"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import React, { useState } from "react";
import {
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function TangoHeader() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const navItems = [
    { name: "Features", link: "/#features" },
    { name: "Pricing", link: "/#pricing" },
    { name: "About", link: "/about" },
    { name: "Testimonials", link: "/#testimonials" },
    { name: "FAQ", link: "/#faq" },
    { name: "Blog", link: "/blog" },
    { name: "Contact", link: "/contact" }
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200">
      <DesktopNav navItems={navItems} hovered={hovered} setHovered={setHovered} />
      <MobileNav navItems={navItems} open={open} setOpen={setOpen} />
    </div>
  );
}

const DesktopNav = ({ navItems, hovered, setHovered }: any) => {
  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null);
      }}
      className="relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start px-6 py-6 lg:flex"
    >
      <Logo />
      <div className="hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-slate-600 lg:flex lg:space-x-2">
        {navItems.map((navItem: any, idx: number) => (
          <Link
            onMouseEnter={() => setHovered(idx)}
            className="relative px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            key={`link=${idx}`}
            href={navItem.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-slate-100"
              />
            )}
            <span className="relative z-20">{navItem.name}</span>
          </Link>
        ))}
      </div>
      <div className="flex items-center space-x-4">
        <SignedOut>
          <Link href="/signin">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors duration-200">
              Sign In
            </button>
          </Link>
          <Link href="/signup">
            <button className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors duration-200">
              Sign Up
            </button>
          </Link>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </motion.div>
  );
};

const MobileNav = ({ navItems, open, setOpen }: any) => {
  return (
    <>
      <motion.div
        className="relative z-[60] mx-auto flex w-full max-w-7xl flex-row items-center justify-between self-start px-6 py-6 lg:hidden"
      >
        <Logo />
        <button
          onClick={() => setOpen(!open)}
          className="relative z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors duration-200"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <IconX size={20} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <IconMenu2 size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute inset-x-0 top-20 z-20 flex w-full flex-col items-center justify-start gap-6 bg-white border-t border-slate-200 px-6 py-8 shadow-lg"
          >
            {navItems.map((navItem: any, idx: number) => (
              <Link
                key={`link=${idx}`}
                href={navItem.link}
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                onClick={() => setOpen(false)}
              >
                {navItem.name}
              </Link>
            ))}
            <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-4">
              <SignedOut>
                <Link href="/signin">
                  <button 
                    className="w-full text-center py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors duration-200"
                    onClick={() => setOpen(false)}
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button 
                    className="w-full text-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors duration-200"
                    onClick={() => setOpen(false)}
                  >
                    Sign Up
                  </button>
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2"
    >
      <img 
        src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1752032941301-0xul9i1n0y4r.png" 
        alt="Tango Logo" 
        width={140} 
        height={112}
        className="object-contain"
        style={{ height: 'auto' }}
      />
    </Link>
  );
}; 