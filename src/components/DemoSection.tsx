
import { useState } from "react";
import { QrCode, Play, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DemoSection = () => {
  const [activeDemo, setActiveDemo] = useState("qr");

  const demos = {
    qr: {
      title: "QR Code Generator",
      description: "Create instant QR codes for any learning module",
      content: (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="text-center space-y-4">
            <div className="w-48 h-48 bg-slate-900 rounded-xl mx-auto flex items-center justify-center">
              <div className="grid grid-cols-8 gap-1">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 ${
                      Math.random() > 0.5 ? 'bg-white' : 'bg-slate-900'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-900">Solar System Module</h4>
              <p className="text-sm text-slate-600">Interactive 3D planetary exploration</p>
              <div className="flex justify-center space-x-4 text-xs text-slate-500">
                <span>Scans: 2,847</span>
                <span>Engagement: 94%</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    ar: {
      title: "AR Experience",
      description: "Immersive 3D learning in augmented reality",
      content: (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Human Heart Model</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="bg-white/20 rounded-lg h-32 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-white/40 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                  <span className="text-sm opacity-80">Rendering 3D Model...</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-lg font-bold">4</div>
                <div className="text-xs opacity-80">Chambers</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-lg font-bold">72</div>
                <div className="text-xs opacity-80">BPM</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                <div className="text-lg font-bold">5L</div>
                <div className="text-xs opacity-80">Blood/min</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    analytics: {
      title: "Learning Analytics",
      description: "Real-time insights into student progress",
      content: (
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-slate-900">Class Performance</h4>
              <span className="text-sm text-green-600 font-medium">↗ +15% this week</span>
            </div>
            <div className="h-32 flex items-end space-x-2">
              {[65, 78, 82, 91, 85, 94, 89].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">89%</div>
                <div className="text-sm text-slate-600">Avg. Completion</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">12m</div>
                <div className="text-sm text-slate-600">Avg. Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">4.7</div>
                <div className="text-sm text-slate-600">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  };

  return (
    <section id="demo" className="py-20 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            See ARLearn in
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Action
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Experience the power of our AR learning platform through interactive demos
            that showcase real classroom scenarios and student engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Demo Navigation */}
          <div className="space-y-4">
            {Object.entries(demos).map(([key, demo]) => (
              <Card
                key={key}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  activeDemo === key
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => setActiveDemo(key)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      activeDemo === key
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {key === 'qr' && <QrCode className="w-6 h-6" />}
                      {key === 'ar' && <Play className="w-6 h-6" />}
                      {key === 'analytics' && <Users className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{demo.title}</h3>
                      <p className="text-sm text-slate-600">{demo.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Demo Content */}
          <div className="lg:col-span-2">
            <div className="animate-fade-in" key={activeDemo}>
              {demos[activeDemo as keyof typeof demos].content}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
          >
            Try Interactive Demo
            <Play className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
