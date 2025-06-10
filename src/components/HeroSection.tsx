
import { Play, QrCode, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="pt-24 pb-16 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-600 text-sm font-medium">
                <QrCode className="w-4 h-4 mr-2" />
                AR-Powered Learning Platform
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Transform
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Education{" "}
                </span>
                with AR
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Revolutionize learning through immersive 3D experiences. Students scan QR codes to access interactive AR content while educators track progress in real-time.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4 group"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-4 border-slate-300 text-slate-700 hover:bg-slate-50 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">500K+</div>
                <div className="text-sm text-slate-600">Students Learning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">12K+</div>
                <div className="text-sm text-slate-600">Educators</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">98%</div>
                <div className="text-sm text-slate-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative">
              {/* Main Device Mockup */}
              <div className="relative z-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-3xl p-2 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-6 h-6" />
                        <span className="font-semibold">AR Scanner</span>
                      </div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    
                    <div className="bg-white/20 backdrop-blur rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-white/30 rounded-lg"></div>
                        <div className="space-y-1">
                          <div className="w-20 h-2 bg-white/40 rounded"></div>
                          <div className="w-16 h-2 bg-white/30 rounded"></div>
                        </div>
                      </div>
                      <div className="w-full h-20 bg-white/20 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <QrCode className="w-8 h-8 mx-auto mb-2 opacity-60" />
                          <div className="text-xs opacity-80">3D Model Loading...</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <div className="flex-1 bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold">85%</div>
                        <div className="text-xs opacity-80">Progress</div>
                      </div>
                      <div className="flex-1 bg-white/20 backdrop-blur rounded-lg p-3 text-center">
                        <div className="text-lg font-semibold">12</div>
                        <div className="text-xs opacity-80">Completed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                <QrCode className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                <Play className="w-10 h-10 text-white" />
              </div>

              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
