
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const benefits = [
    "30-day free trial",
    "No credit card required",
    "Full platform access",
    "24/7 support included"
  ];

  return (
    <section className="py-20 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute top-1/2 right-0 w-24 h-24 bg-white rounded-full translate-x-12"></div>
            <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-white rounded-full translate-y-10"></div>
          </div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Ready to Transform Your Classroom?
            </h2>
            
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of educators who are already creating more engaging, 
              effective learning experiences with ARLearn.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 group"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4"
              >
                Schedule a Demo
              </Button>
            </div>

            <p className="text-sm text-blue-200">
              Questions? Contact our education specialists at{" "}
              <a href="mailto:education@arlearn.com" className="underline hover:text-white">
                education@arlearn.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
