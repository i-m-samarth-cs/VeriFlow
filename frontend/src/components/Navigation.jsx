import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
            <span className="text-white font-semibold text-lg">VeriFlow™</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === "/" 
                  ? "text-white" 
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Home
            </Link>
            <Link 
              to="/workflows" 
              className={cn(
                "text-sm font-medium transition-colors",
                location.pathname === "/workflows" 
                  ? "text-white" 
                  : "text-neutral-400 hover:text-white"
              )}
            >
              Workflows
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
