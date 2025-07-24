"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

const TangoFAQs = [
  {
    question: "What makes Tango different from other CRM platforms?",
    answer:
      "Tango is specifically designed for creators, coaches, podcasters, and freelancers. Unlike generic CRMs, we offer niche-specific pipelines, templates, and workflows that are tailored to your industry. Our platform includes specialized features like content calendar integration, client session tracking, and automated follow-up sequences that other CRMs simply don't provide.",
  },
  {
    question: "Can I manage more than one niche inside Tango?",
    answer:
      "Yes! Tango lets you select a primary niche during onboarding and add up to 3 additional niches anytime. Each niche has its own customized dashboard, CRM pipeline, calendar, and analytics — all in one account.",
  },
  {
    question: "How does the pricing work and what's included?",
    answer:
      "Tango offers transparent, tiered pricing starting at $39.99/month for the Creator plan. All plans include unlimited contacts, custom pipelines, email automation, and mobile access. Higher tiers add features like advanced analytics, team collaboration, and priority support.",
  },
  {
    question: "Do I need any technical skills to use Tango?",
    answer:
      "Nope! Tango is built to be clean, intuitive, and easy to use — whether you're filming videos, coaching clients, or running a podcast. If you can manage a calendar and send an email, you can run your business in Tango.",
  },
  {
    question: "What happens when I sign up?",
    answer:
      "You'll choose a paid plan starting at $39.99/month (or save with yearly billing). Each plan includes one niche, and you can add more niches for $9.99/month each. Cancel anytime, no setup fees.",
  },
];

export function TangoFaqs() {
  const [open, setOpen] = useState<string | null>(null);
  
  return (
    <section id="faq" className="bg-gradient-to-br from-slate-50 to-emerald-50 py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center mb-16">
          <h2 className="text-4xl font-semibold tracking-tight text-slate-800 sm:text-5xl font-[var(--font-display)]">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Everything you need to know about Tango CRM. Can't find the answer you're looking for? 
            <a href="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium ml-1">
              Contact our support team
            </a>
          </p>
        </div>
        
        <div className="mx-auto max-w-3xl">
          {TangoFAQs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              open={open}
              setOpen={setOpen}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQItem = ({
  question,
  answer,
  setOpen,
  open,
}: {
  question: string;
  answer: string;
  open: string | null;
  setOpen: (open: string | null) => void;
}) => {
  const isOpen = open === question;

  return (
    <div
      className="mb-6 w-full cursor-pointer rounded-xl bg-white p-6 border border-slate-200 transition-shadow"
      onClick={() => {
        if (isOpen) {
          setOpen(null);
        } else {
          setOpen(question);
        }
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 pr-8">
            {question}
          </h3>
          <AnimatePresence mode="wait">
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-4 text-slate-600 leading-relaxed">
                  {answer}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="ml-4 flex-shrink-0">
          <IconChevronDown
            className={cn(
              "h-5 w-5 text-slate-400 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>
    </div>
  );
}; 