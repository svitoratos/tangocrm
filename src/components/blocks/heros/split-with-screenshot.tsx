"use client";
import { cn } from "@/lib/utils";
import { IconMenu2, IconX, IconChevronRight, IconPlayerPlay, IconUser, IconLogout } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";

interface SplitWithScreenshotProps {
  showLoggedInState?: boolean;
}

export default function SplitWithScreenshot({ showLoggedInState = false }: SplitWithScreenshotProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const handleLogout = () => {
    signOut({ redirectUrl: '/' });
  };

  return (
    <div className="relative isolate overflow-hidden bg-white">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full mask-[radial-gradient(100%_100%_at_top_right,white,transparent)] stroke-slate-200"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" width="100%" height="100%" strokeWidth={0} />
      </svg>
      
      <Navbar user={user} isLoaded={isLoaded} onLogout={handleLogout} />
      
      <div className="mx-auto max-w-7xl px-6 pt-10 pb-16 sm:pb-20 lg:px-8 lg:py-6">
        <div className="mx-auto max-w-2xl text-center lg:mx-auto lg:max-w-4xl">
          <div className="mt-16 sm:mt-20 lg:mt-12">
            <div className="inline-flex space-x-6">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm/6 font-semibold text-emerald-600 ring-1 ring-emerald-500/10 ring-inset">
                Trusted by Thousands of Creators Worldwide
              </span>
              <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-slate-600">
                <IconChevronRight aria-hidden="true" className="size-5 text-slate-400" />
              </span>
            </div>
          </div>

          <h1 className="mt-8 text-5xl font-semibold tracking-tight text-pretty text-slate-800 sm:text-7xl">
            Finally, The CRM <em className="text-emerald-600">Built</em> for Your <em className="text-emerald-600">Creative</em> Business
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-slate-600 sm:text-xl/8">
            Track brand deals, manage clients, organize content, and streamline your workflow. Built specifically for influencers, coaches, podcasters, and freelancers.
          </p>
          <div className="mt-8 flex items-center justify-center gap-x-6">
            {isLoaded && user ? (
              // Logged in state
              <>
                <Link 
                  href="/dashboard"
                  className="rounded-md bg-emerald-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 inline-block"
                >
                  Go to Dashboard
                </Link>
                <Link 
                  href="/pricing"
                  className="inline-flex items-center gap-x-2 text-sm/6 font-semibold text-orange-600 hover:text-orange-700"
                >
                  <IconPlayerPlay className="size-4" />
                  Learn More
                </Link>
              </>
            ) : (
              // Not logged in state
              <>
                <Link 
                  href="/sign-up"
                  className="rounded-md bg-emerald-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 inline-block"
                >
                  Join Tango
                </Link>
                <a href="#" className="inline-flex items-center gap-x-2 text-sm/6 font-semibold text-orange-600 hover:text-orange-700">
                  <IconPlayerPlay className="size-4" />
                  Learn More
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface NavbarProps {
  user: any;
  isLoaded: boolean;
  onLogout: () => void;
}

const Navbar = ({ user, isLoaded, onLogout }: NavbarProps) => {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  const navItems = [
    { name: "Features", link: "#features" },
    { name: "Pricing", link: "#pricing" },
    { name: "Blog", link: "/blog" },
    { name: "About", link: "/about" },
    { name: "Testimonials", link: "#testimonials" },
    { name: "FAQ", link: "#faq" },
    { name: "Contact", link: "/contact" }
  ];

  return (
    <div className="w-full">
      <DesktopNav navItems={navItems} hovered={hovered} setHovered={setHovered} user={user} isLoaded={isLoaded} onLogout={onLogout} />
      <MobileNav navItems={navItems} open={open} setOpen={setOpen} user={user} isLoaded={isLoaded} onLogout={onLogout} />
    </div>
  );
};

const DesktopNav = ({ navItems, hovered, setHovered, user, isLoaded, onLogout }: any) => {
  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null);
      }}
      className="relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start px-6 py-6 lg:flex"
    >
      <Logo />
      <div className="hidden flex-1 flex-row items-center justify-center space-x-2 text-sm font-medium text-muted-foreground lg:flex lg:space-x-2">
        {navItems.map((navItem: any, idx: number) => (
          <Link
            onMouseEnter={() => setHovered(idx)}
            className="relative px-4 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
            key={`link=${idx}`}
            href={navItem.link}
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-muted"
              />
            )}
            <span className="relative z-20">{navItem.name}</span>
          </Link>
        ))}
      </div>
      <div className="flex items-center space-x-4">
        {isLoaded && user ? (
          // Logged in state
          <>
            <Link 
              href="/dashboard"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
            >
              <IconUser className="w-4 h-4" />
              Dashboard
            </Link>
            <button 
              onClick={onLogout}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2"
            >
              <IconLogout className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          // Not logged in state
          <>
            <Link 
              href="/sign-in"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up"
              className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors duration-200"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
};

const MobileNav = ({ navItems, open, setOpen, user, isLoaded, onLogout }: any) => {
  return (
    <>
      <motion.div
        animate={{ borderRadius: open ? "0px" : "0px" }}
        key={String(open)}
        className="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-6 py-6 lg:hidden"
      >
        <div className="flex w-full flex-row items-center justify-between">
          <Logo />
          {open ? (
            <IconX
              className="text-foreground hover:text-muted-foreground cursor-pointer"
              onClick={() => setOpen(!open)}
            />
          ) : (
            <IconMenu2
              className="text-foreground hover:text-muted-foreground cursor-pointer"
              onClick={() => setOpen(!open)}
            />
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute inset-x-0 top-20 z-20 flex w-full flex-col items-center justify-start gap-6 bg-background border-t border-border px-6 py-8 shadow-lg"
            >
              {navItems.map((navItem: any, idx: number) => (
                <Link
                  key={`link=${idx}`}
                  href={navItem.link}
                  className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                  onClick={() => setOpen(false)}
                >
                  {navItem.name}
                </Link>
              ))}
              <div className="flex flex-col items-center gap-4 w-full max-w-xs mt-4">
                {isLoaded && user ? (
                  // Logged in state
                  <>
                    <Link 
                      href="/dashboard"
                      className="w-full text-center py-2 text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                      onClick={() => setOpen(false)}
                    >
                      <IconUser className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        onLogout();
                        setOpen(false);
                      }}
                      className="w-full text-center py-2 text-muted-foreground hover:text-foreground font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <IconLogout className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  // Not logged in state
                  <>
                    <Link 
                      href="/sign-in"
                      className="w-full text-center py-2 text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
                      onClick={() => setOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/sign-up"
                      className="w-full text-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors duration-200"
                      onClick={() => setOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
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