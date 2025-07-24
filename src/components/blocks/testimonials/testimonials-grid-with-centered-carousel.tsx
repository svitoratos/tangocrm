"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { Transition } from "@headlessui/react";

export function TestimonialsGridWithCenteredCarousel() {
  return (
    <div id="testimonials" className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-12 overflow-hidden h-full bg-white">
      <div className="pb-12">
        <h1 className="pt-4 font-bold text-slate-800 text-lg md:text-2xl text-center">
          Trusted by creators and freelancers worldwide
        </h1>
        <p className="text-base text-slate-600 text-center">
          See how creative professionals are transforming their businesses with our CRM.
        </p>
      </div>

      <div className=" relative">
        <TestimonialsSlider />
        <div className="h-full max-h-screen md:max-h-none overflow-hidden w-full bg-slate-50 opacity-30 [mask-image:radial-gradient(circle_at_center,transparent_10%,white_99%)]">
          <TestimonialsGrid />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-40 w-full bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}

export const TestimonialsGrid = () => {
  const first = testimonials.slice(0, 3);
  const second = testimonials.slice(3, 6);
  const third = testimonials.slice(6, 9);
  const fourth = testimonials.slice(9, 12);

  const grid = [first, second, third, fourth];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto ">
      {grid.map((testimonialsCol, index) => (
        <div key={`testimonials-col-${index}`} className="grid gap-4">
          {testimonialsCol.map((testimonial, testimonialIndex) => (
            <Card key={`testimonial-${testimonial.name}-${index}-${testimonialIndex}`}>
              <Quote>{testimonial.quote}</Quote>
              <div className="flex gap-2 items-center mt-8">
                <div className="flex flex-col">
                  <QuoteDescription>{testimonial.name}</QuoteDescription>
                  <QuoteDescription className="text-[10px] text-slate-400">
                    {testimonial.designation}
                  </QuoteDescription>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "p-8 rounded-xl bg-slate-50 group",
        className
      )}
    >
      {children}
    </div>
  );
};

export const Quote = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3
      className={cn(
        "text-xs font-semibold text-slate-800 py-2",
        className
      )}
    >
      {children}
    </h3>
  );
};

export const QuoteDescription = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-xs font-normal text-slate-600 max-w-sm",
        className
      )}
    >
      {children}
    </p>
  );
};

interface Testimonial {
  src?: string;
  quote: string;
  name: string;
  designation?: string;
}

export const testimonials: Testimonial[] = [
  {
    name: "Sarah C.",
    quote:
      "\"Finally, a CRM that understands my coaching business. The client journey mapping is perfect.\"",
    designation: "Life Coach",
  },
  {
    name: "Marcus R.",
    quote:
      "\"Managing podcast guests and sponsors has never been easier. The pipeline keeps everything organized.\"",
    designation: "Tech Podcast Host",
  },
  {
    name: "Alex K.",
    quote:
      "\"As a content creator, I love how it tracks brand collaborations and content performance in one place.\"",
    designation: "YouTuber & Content Creator",
  },
  {
    name: "Jessica T.",
    quote:
      "\"The client onboarding workflows have streamlined my graphic design business. Everything is automated perfectly.\"",
    designation: "Freelance Graphic Designer",
  },
  {
    name: "David P.",
    quote:
      "\"Managing my photography clients from inquiry to final delivery is seamless. The portfolio integration is fantastic.\"",
    designation: "Wedding Photographer",
  },
  {
    name: "Maria S.",
    quote:
      "\"Running my online course business has become so much easier. Student progress tracking and communication tools are amazing.\"",
    designation: "Online Course Creator",
  },
  {
    name: "Jordan M.",
    quote:
      "\"The project timeline features have revolutionized how I manage web development clients. Everything stays on track.\"",
    designation: "Freelance Web Developer",
  },
  {
    name: "Emma W.",
    quote:
      "\"Perfect for managing my consulting practice. Client relationships and project deliverables are beautifully organized.\"",
    designation: "Business Consultant",
  },
  {
    name: "Ryan B.",
    quote:
      "\"As a freelance writer, tracking article deadlines, client feedback, and invoicing has never been this streamlined.\"",
    designation: "Freelance Copywriter",
  },
  {
    name: "Lisa Z.",
    quote:
      "\"The social media campaign tracking helps me show clear ROI to my clients. The analytics dashboard is incredible.\"",
    designation: "Social Media Manager",
  },
  {
    name: "Carlos R.",
    quote:
      "\"Managing my fitness coaching clients from nutrition plans to workout tracking is effortless. The mobile app is perfect.\"",
    designation: "Personal Trainer & Nutritionist",
  },
  {
    name: "Sofia A.",
    quote:
      "\"Finally found a CRM that understands the creative process. Project timelines, mood boards, and client approvals all in one place.\"",
    designation: "Creative Director & Brand Strategist",
  },
];

export const TestimonialsSlider = () => {
  const [active, setActive] = useState<number>(0);
  const [autorotate, setAutorotate] = useState<boolean>(true);
  const testimonialsRef = useRef<HTMLDivElement>(null);

  const slicedTestimonials = testimonials.slice(0, 3);

  useEffect(() => {
    if (!autorotate) return;
    const interval = setInterval(() => {
      setActive(
        active + 1 === slicedTestimonials.length ? 0 : (active) => active + 1
      );
    }, 7000);
    return () => clearInterval(interval);
  }, [active, autorotate, slicedTestimonials.length]);

  const heightFix = () => {
    if (testimonialsRef.current && testimonialsRef.current.parentElement)
      testimonialsRef.current.parentElement.style.height = `${testimonialsRef.current.clientHeight}px`;
  };

  useEffect(() => {
    heightFix();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        heightFix();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <section className="absolute inset-0 mt-20 md:mt-60">
      <div className="max-w-3xl mx-auto  relative z-40 h-80">
        <div className="relative pb-12 md:pb-20">
          {/* Particles animation */}

          {/* Carousel */}
          <div className="text-center">

            {/* Text */}
            <div className="mb-10 transition-all duration-150 delay-300 ease-in-out px-8 sm:px-6">
              <div className="relative flex flex-col" ref={testimonialsRef}>
                {slicedTestimonials.map((item, index) => (
                  <Transition
                    key={index}
                    show={active === index}
                    enter="transition ease-in-out duration-500 delay-200 order-first"
                    enterFrom="opacity-0 -translate-x-4"
                    enterTo="opacity-100 translate-x-0"
                    leave="transition ease-out duration-300 delay-300 absolute"
                    leaveFrom="opacity-100 translate-x-0"
                    leaveTo="opacity-0 translate-x-4"
                    beforeEnter={() => heightFix()}
                    as="div"
                  >
                    <div className="text-base text-slate-800 md:text-xl font-bold mb-4">
                      {item.quote}
                    </div>
                    <div className="text-sm text-slate-600">
                      {item.name} • {item.designation}
                    </div>
                  </Transition>
                ))}
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-wrap justify-center -m-1.5 px-8 sm:px-6">
              {slicedTestimonials.map((item, index) => (
                <button
                  className={cn(
                    `px-2 py-1 rounded-full m-1.5 text-xs border border-transparent text-slate-600 transition duration-150 ease-in-out [background:linear-gradient(theme(colors.background),_theme(colors.background))_padding-box,_conic-gradient(theme(colors.neutral.400),_theme(colors.neutral.700)_25%,_theme(colors.neutral.700)_75%,_theme(colors.neutral.400)_100%)_border-box] relative before:absolute before:inset-0 before:bg-slate-100/30 before:rounded-full before:pointer-events-none ${
                      active === index
                        ? "border-primary/50"
                        : "border-transparent opacity-70"
                    }`
                  )}
                  key={index}
                  onClick={() => {
                    setActive(index);
                    setAutorotate(false);
                  }}
                >
                  <span className="relative">
                    <span className="text-slate-800 font-bold">
                      {item.name}
                    </span>{" "}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};