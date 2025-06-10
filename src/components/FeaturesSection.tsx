
import { QrCode, BookOpen, Users, BarChart3, Check, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FeaturesSection = () => {
  const features = [
    {
      icon: QrCode,
      title: "QR Code System",
      description: "Dynamic QR generation with batch creation capabilities, custom styling, and comprehensive analytics tracking.",
      highlights: [
        "Automatic QR generation for learning modules",
        "Batch QR creation for textbooks",
        "Custom branded QR codes",
        "Scan analytics and tracking"
      ]
    },
    {
      icon: BookOpen,
      title: "AR Visualization Engine",
      description: "High-quality 3D models with interactive animations, multi-layered content, and real-time manipulation capabilities.",
      highlights: [
        "Interactive 3D model rendering",
        "Step-by-step animated explanations",
        "Multiple difficulty levels",
        "Cross-platform compatibility"
      ]
    },
    {
      icon: Users,
      title: "Content Management",
      description: "Intuitive drag-and-drop interface with extensive 3D model library and custom content upload support.",
      highlights: [
        "Easy content upload and organization",
        "Pre-built educational models",
        "Version control and updates",
        "Multi-format content support"
      ]
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time tracking of user engagement, learning progress, and comprehensive performance metrics.",
      highlights: [
        "Live engagement tracking",
        "Learning outcome analysis",
        "Geographic usage insights",
        "Customizable report generation"
      ]
    }
  ];

  return (
    <section id="features" className="py-20 px-6 sm:px-8 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            Powerful Features for
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Modern Education
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our comprehensive platform combines cutting-edge AR technology with practical educational tools 
            to create an engaging and effective learning environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur hover:scale-105 animate-scale-in"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <CardHeader className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-slate-600 leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {feature.highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <button className="flex items-center text-blue-600 font-medium group-hover:text-purple-600 transition-colors">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Multi-User Collaboration</h3>
            <p className="text-slate-600">Shared AR sessions and virtual classrooms for collaborative learning experiences.</p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-blue-50 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Assessment & Gamification</h3>
            <p className="text-slate-600">AR-based quizzes with gamified learning through points, badges, and achievements.</p>
          </div>

          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Content Creation Tools</h3>
            <p className="text-slate-600">Visual AR content builder with templates and collaborative editing capabilities.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
