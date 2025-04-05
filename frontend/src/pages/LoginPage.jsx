import LoginButton from "../auth/login";
import { useState, useEffect } from "react";

function LoginPage() {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      // Get normalized position (0-100)
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Create dynamic gradient based on mouse position
  const dynamicGradient = {
    background: `radial-gradient(600px at ${mousePosition.x}% ${mousePosition.y}%, rgba(29, 78, 216, 0.15), transparent 80%)`,
  };

  return (
    <div className="w-full flex flex-col min-h-screen" >
      <div
        className="flex flex-col lg:flex-row justify-center items-center min-h-screen w-full transition-colors duration-300 "
        style={dynamicGradient}
      >
        <div className="w-full   max-w-6xl flex flex-col lg:flex-row items-center justify-between px-8 py-12 gap-12">
          {/* Left side with logo */}
          <div className="mr-20 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div
              className="transition-all duration-500 ease-in-out transform p-6"
              style={{
                transform: isHovering ? "translateY(-10px)" : "translateY(0)",
                filter: isHovering
                  ? "drop-shadow(0 25px 25px rgba(0,0,0,0.15))"
                  : "drop-shadow(0 15px 15px rgba(0,0,0,0.1))",
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <img
                src="/icon.png"
                alt="Logo"
                className="w-64 lg:w-80 object-contain"
              />
            </div>

            <h1 className="mt-6 text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
              Real-Time Collaboration Made Effortless
            </h1>
          </div>

          {/* Right side with login */}
          <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white">Sign In</h2>
              <p className="text-blue-200 mt-2">Access your account</p>
            </div>

            <div className="flex justify-center">
              <div className="transform transition-transform hover:scale-105 duration-300">
                <LoginButton />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-blue-200">
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white px-6 py-8 mt-auto w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
          {/* Brand Section */}
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">CodeSync</h1>
            <p className="text-sm mt-1 text-gray-400">
              Real-time coding. Anywhere. Anytime.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-2 text-sm">
            <span className="font-semibold text-white">Quick Links</span>
            <a href="#features" className="hover:text-cyan-400">
              Features
            </a>
            <a href="#about" className="hover:text-cyan-400">
              About
            </a>
            <a href="#contact" className="hover:text-cyan-400">
              Contact
            </a>
          </div>

          {/* Social or Credits */}
          <div className="flex flex-col items-start sm:items-end space-y-2 text-sm">
            <span className="font-semibold text-white">Connect</span>
            <a
              href="https://github.com/aniketchawardol/CodeSync"
              target="_blank"
              className="hover:text-cyan-400"
            >
              GitHub ↗
            </a>
            <p className="text-gray-500">
              © {new Date().getFullYear()} CodeSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
