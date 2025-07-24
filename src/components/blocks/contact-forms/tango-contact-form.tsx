"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { IconMail, IconPhone, IconMapPin, IconSend, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export function TangoContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Reset form after showing success
        setTimeout(() => {
          setIsSubmitted(false);
          setFormData({ name: "", email: "", company: "", subject: "", message: "" });
        }, 3000);
      } else {
        const errorData = await response.json();
        console.error('Contact form error:', errorData);
        alert('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-4 py-10 md:px-6 md:py-20 lg:grid-cols-2">
      {/* Left Column - Contact Info */}
      <div className="relative flex flex-col items-start space-y-8">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
              <IconMail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Email Us</h3>
              <p className="text-slate-600">hello@gotangocrm.com</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-bold text-slate-800">Tango is Built for Creators Like You</h3>
          <p className="text-lg text-slate-600 leading-relaxed">
            Whether you're a content creator ready to organize your business, a coach looking to scale, 
            a freelancer juggling multiple clients, or a podcaster managing sponsorships — Tango is here 
            to simplify your workflow and help you grow with clarity.
          </p>
          <p className="text-slate-600 leading-relaxed">
            Have a question or just want to say hello?<br />
            Our team typically responds within 24 hours — we can't wait to connect.
          </p>
        </motion.div>

        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 gap-4"
        >
          <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 p-4">
            <h4 className="font-semibold text-emerald-800">Quick Setup</h4>
            <p className="text-sm text-emerald-700">Get started in minutes, not hours</p>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Contact Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <div className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-purple-50/50" />
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 opacity-20" />
          <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 opacity-20" />
          
          <div className="relative z-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Send us a message</h2>
              <p className="text-slate-600">Tell us about your project and we'll get back to you soon.</p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600">
                  <IconCheck className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">Message Sent!</h3>
                <p className="text-slate-600">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="Your company name"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200"
                    placeholder="What's this about?"
                  />
                </div>



                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
                    placeholder="Tell us about your project, questions, or how we can help you..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "w-full rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-white font-medium shadow-lg hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                    isSubmitting && "animate-pulse"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <IconSend className="h-4 w-4" />
                      <span>Send Message</span>
                    </div>
                  )}
                </motion.button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 