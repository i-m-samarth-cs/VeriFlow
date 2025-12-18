import React from "react";
import { Boxes } from "@/components/ui/background-boxes";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, FileText, TrendingUp } from "lucide-react";

export function BackgroundBoxesDemo() {
  return (
    <div className="min-h-screen relative w-full overflow-hidden bg-black">
      {/* Hero Section with Animated Background */}
      <div className="h-screen relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center">
        <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
        <Boxes />
        <div className="relative z-20 text-center px-4">
          <h1 className="md:text-6xl text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            VeriFlow&trade;
          </h1>
          <p className="md:text-2xl text-xl text-neutral-300 mb-2">
            Trust-First Agentic Workflow Engine
          </p>
          <p className="text-center mt-4 text-neutral-400 max-w-2xl">
            Don&apos;t just run AI workflows. Prove they ran correctly.
          </p>
          <p className="text-center mt-2 text-neutral-500 text-sm max-w-2xl font-mono">
            Powered by Cortensor decentralized inference • Validated with PoI • Scored with PoUW
          </p>
          <Link
            to="/workflows"
            className="inline-block mt-8 px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors font-mono text-sm"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black border-t border-gray-800 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Core Philosophy
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16 font-mono">
            &ldquo;If AI is going to act — it must be provable.&rdquo;
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="border border-gray-800 p-6">
              <div className="w-12 h-12 bg-white/10 border border-gray-700 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                PoI Validation
              </h3>
              <p className="text-sm text-gray-400">
                Redundant inference across multiple nodes ensures consensus and accuracy
              </p>
            </div>

            <div className="border border-gray-800 p-6">
              <div className="w-12 h-12 bg-white/10 border border-gray-700 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                PoUW Scoring
              </h3>
              <p className="text-sm text-gray-400">
                Trust scores validate inference quality through deterministic checks
              </p>
            </div>

            <div className="border border-gray-800 p-6">
              <div className="w-12 h-12 bg-white/10 border border-gray-700 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Evidence Bundles
              </h3>
              <p className="text-sm text-gray-400">
                Cryptographic attestations provide verifiable proof of execution
              </p>
            </div>

            <div className="border border-gray-800 p-6">
              <div className="w-12 h-12 bg-white/10 border border-gray-700 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Observability
              </h3>
              <p className="text-sm text-gray-400">
                Complete visibility into workflow execution and validation metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="bg-black border-t border-gray-800 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-16" style={{ fontFamily: 'Playfair Display, serif' }}>
            Trusted by Critical Workflows
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="border border-gray-800 p-8 hover:border-gray-700 transition-colors">
              <img 
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop" 
                alt="Research & Analytics"
                className="w-full h-48 object-cover mb-4 grayscale"
              />
              <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Research & Due-Diligence
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Multi-step research agents with fact verification and hallucination detection
              </p>
              <p className="text-xs text-gray-600 font-mono">Trust Score: 89-95%</p>
            </div>

            <div className="border border-gray-800 p-8 hover:border-gray-700 transition-colors">
              <img 
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop" 
                alt="DevOps & Infrastructure"
                className="w-full h-48 object-cover mb-4 grayscale"
              />
              <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                DevOps Incident Analysis
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Automated incident response with log analysis and root cause detection
              </p>
              <p className="text-xs text-gray-600 font-mono">Trust Score: 91-97%</p>
            </div>

            <div className="border border-gray-800 p-8 hover:border-gray-700 transition-colors">
              <img 
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop" 
                alt="Compliance & Legal"
                className="w-full h-48 object-cover mb-4 grayscale"
              />
              <h3 className="text-xl font-semibold text-white mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                Compliance Workflows
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                AI-powered compliance checking with cryptographic attestation proof
              </p>
              <p className="text-xs text-gray-600 font-mono">Trust Score: 93-98%</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-black border-t border-gray-800 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to Build Trust?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Start executing verifiable AI workflows with cryptographic-grade proof
          </p>
          <Link
            to="/workflows"
            className="inline-block px-8 py-3 bg-white text-black hover:bg-gray-200 transition-colors font-mono text-sm"
          >
            Launch Workflow Builder
          </Link>
        </div>
      </div>
    </div>
  );
}
