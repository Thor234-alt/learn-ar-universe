
import { Star, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Dr. Sarah Chen",
      role: "Professor of Biology, Stanford University",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      content: "ARLearn has revolutionized how I teach complex molecular structures. Students can now visualize and interact with 3D models in ways that were impossible before. The engagement levels have increased dramatically.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "High School Physics Teacher",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face",
      content: "The analytics dashboard gives me incredible insights into how my students learn. I can see exactly which concepts they struggle with and adjust my teaching accordingly. It's like having X-ray vision into learning.",
      rating: 5
    },
    {
      name: "Emma Thompson",
      role: "Grade 10 Student",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      content: "Learning chemistry used to be so boring, but now I can actually see how molecules interact! The AR models make everything so much easier to understand. I wish all my classes used this technology.",
      rating: 5
    },
    {
      name: "Prof. James Wilson",
      role: "Dean of Engineering, MIT",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      content: "We've integrated ARLearn across our entire engineering curriculum. The ability for students to manipulate complex 3D engineering models has improved comprehension rates by over 40%. This is the future of education.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            What Educators
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Are Saying
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Discover how educators and students worldwide are transforming their 
            learning experiences with our AR platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur animate-fade-in"
              style={{
                animationDelay: `${index * 150}ms`
              }}
            >
              <CardContent className="p-8">
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-slate-700 text-lg leading-relaxed mb-6">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-8">Trusted by leading educational institutions</p>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold text-slate-700">Stanford</div>
            <div className="text-2xl font-bold text-slate-700">MIT</div>
            <div className="text-2xl font-bold text-slate-700">Harvard</div>
            <div className="text-2xl font-bold text-slate-700">Oxford</div>
            <div className="text-2xl font-bold text-slate-700">Cambridge</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
