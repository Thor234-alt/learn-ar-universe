
import { BarChart3, Users, BookOpen, QrCode } from "lucide-react";

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      value: "500K+",
      label: "Active Students",
      description: "Learning through AR experiences daily"
    },
    {
      icon: BookOpen,
      value: "12K+",
      label: "Educators",
      description: "Creating immersive content worldwide"
    },
    {
      icon: QrCode,
      value: "2.5M",
      label: "QR Scans",
      description: "Interactive learning sessions completed"
    },
    {
      icon: BarChart3,
      value: "98%",
      label: "Satisfaction",
      description: "Students prefer AR over traditional methods"
    }
  ];

  return (
    <section className="py-20 px-6 sm:px-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Trusted by Educators Worldwide
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of schools and universities already transforming 
            their educational experience with ARLearn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center group animate-scale-in"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl lg:text-5xl font-bold mb-2 group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-xl font-semibold mb-2">{stat.label}</div>
              <div className="text-blue-100 text-sm">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">25%</div>
            <div className="text-blue-100">Improvement in test scores</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">3x</div>
            <div className="text-blue-100">Longer engagement time</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">85%</div>
            <div className="text-blue-100">Increase in participation</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
