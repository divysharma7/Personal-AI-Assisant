export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  company: string;
}

export const primaryTestimonial: Testimonial = {
  quote:
    "I used to switch between five apps just to plan my morning. Now I open Life OS, run my morning ritual, and I know exactly what the day looks like. The focus mode alone changed how I work.",
  name: "Sarah Chen",
  role: "Product Designer",
  company: "Independent",
};

export const testimonials: Testimonial[] = [
  {
    quote:
      "The habit tracking with heatmaps made me realize I was skipping workouts on Wednesdays consistently. Small insight, big change.",
    name: "Marcus Rivera",
    role: "Engineering Manager",
    company: "Scale AI",
  },
  {
    quote:
      "Instead of spending an hour assembling context, I now start with a clear next step. The Eisenhower Matrix view is exactly how I think about priorities.",
    name: "Aisha Patel",
    role: "Startup Founder",
    company: "Stealth",
  },
];