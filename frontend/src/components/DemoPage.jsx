import React from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/lib/utils";
import { Sparkles, CheckCircle, Shield } from "lucide-react";

export function DemoPage() {
  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      <Boxes />
      
      <div className="relative z-20 container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className={cn("md:text-5xl text-3xl font-bold text-white mb-4")}>
            Interactive Background Boxes Demo
          </h1>
          <p className="text-neutral-400 text-lg">
            Hover over the background to see the colorful animation effect
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mb-4">
              <Sparkles className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Framer Motion Powered
            </h3>
            <p className="text-neutral-400">
              Smooth animations powered by Framer Motion, one of the best animation libraries for React.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Tailwind CSS
            </h3>
            <p className="text-neutral-400">
              Built with Tailwind CSS utility classes for rapid development and easy customization.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mb-4">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Shadcn/ui Compatible
            </h3>
            <p className="text-neutral-400">
              Seamlessly integrates with shadcn/ui component structure and design system.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-lg border border-slate-700 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-neutral-400 text-left mb-4">
              The background consists of a 3D-transformed grid of boxes. Each box responds to hover events with random colors from a predefined palette. The effect creates an interactive, dynamic background that adds visual interest without being distracting.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="text-white font-semibold mb-2">Features:</h4>
                <ul className="text-neutral-400 space-y-1 text-sm">
                  <li>• 150x100 grid of interactive boxes</li>
                  <li>• 9 vibrant color palette</li>
                  <li>• Smooth hover animations</li>
                  <li>• Performance optimized with React.memo</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Use Cases:</h4>
                <ul className="text-neutral-400 space-y-1 text-sm">
                  <li>• Landing page hero sections</li>
                  <li>• Dashboard backgrounds</li>
                  <li>• Portfolio websites</li>
                  <li>• SaaS product pages</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
