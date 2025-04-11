import LoginButton from "../auth/login";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { 
  Code, 
  MessageSquare, 
  FileText, 
  Users,
  Github,
  Twitter,
  Linkedin,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

function LoginPage() {
  const { loginWithRedirect } = useAuth0();
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const mainRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const featureRefs = useRef([]);

  // Setup scroll animations
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start", "end"]
  });
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  
  const bgOpacity = useTransform(smoothProgress, [0, 0.2], [0, 1]);
  const heroScale = useTransform(smoothProgress, [0, 0.2], [1, 0.9]);
  const heroOpacity = useTransform(smoothProgress, [0, 0.2], [1, 0.6]);

  const features = [
    {
      title: "Real-time Code Editor",
      description: "Collaborate with your team in real-time with our powerful code editor. See changes instantly as you code together.",
      icon: <Code className="w-6 h-6" />,
      image: "/screenshots/codeOutput.png",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "AI Chat Assistant",
      description: "Get instant help from our AI-powered chat assistant. Ask questions, get code suggestions, and debug issues in real-time.",
      icon: <MessageSquare className="w-6 h-6" />,
      image: "/screenshots/ChatBot.png",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "File Management",
      description: "Organize your code with our intuitive file system. Create, edit, and manage files with ease.",
      icon: <FileText className="w-6 h-6" />,
      image: "/screenshots/fileStructure.png",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with built-in chat and collaboration tools. Share ideas and solve problems as a team.",
      icon: <Users className="w-6 h-6" />,
      image: "/screenshots/Chat.png",
      color: "from-orange-500 to-red-500"
    }
  ];

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = Math.round((e.clientX / window.innerWidth) * 100);
      const y = Math.round((e.clientY / window.innerHeight) * 100);
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to features section
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const dynamicGradient = {
    background: `radial-gradient(600px at ${mousePosition.x}% ${mousePosition.y}%, rgba(29, 78, 216, 0.15), transparent 80%)`,
  };

  return (
    <div ref={mainRef} className="w-full min-h-screen bg-gray-900 overflow-x-hidden">
      {/* Background Particles Effect */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="fixed w-full inset-0 pointer-events-none"
      >
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.5 + 0.1,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100, null],
              opacity: [null, Math.random() * 0.8 + 0.2, null]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: Math.random() * 10 + 15,
              ease: "easeInOut"
            }}
            className="absolute rounded-full bg-blue-500"
            style={{ 
              width: Math.random() * 4 + 2 + 'px', 
              height: Math.random() * 4 + 2 + 'px',
              filter: 'blur(1px)'
            }}
          />
        ))}
      </motion.div>

      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        style={{ 
          scale: heroScale,
          opacity: heroOpacity
        }}
        className="flex flex-col lg:flex-row justify-center items-center min-h-screen w-full transition-colors duration-300 relative"
      >
        <div 
          className="w-full flex flex-col lg:flex-row items-center justify-around px-8 py-12 gap-12 relative"
          style={dynamicGradient}
        >
          {/* Left side with logo and features */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
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
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200"
            >
              Real-Time Collaboration Made Effortless
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-4 text-lg text-gray-300"
            >
              Code together in real-time with our powerful collaborative platform
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToFeatures}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 rounded-full text-white font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/30"
              >
                Discover Features <ChevronDown className="w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>

          {/* Right side with login */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-1/3 bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
              <p className="text-blue-200 mt-2">Sign in to continue</p>
            </div>

            <div className="flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="transform transition-transform duration-300"
              >
                <LoginButton />
              </motion.div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-blue-200">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <div ref={featuresRef} className="py-24 px-8 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative mb-16"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-500/20 rounded-full p-3"
            >
              <Sparkles className="w-6 h-6 text-blue-300" />
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold text-white text-center mb-4"
            >
              Key Features
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-400 text-center mb-16 max-w-2xl mx-auto"
            >
              Experience seamless collaboration with our powerful set of features designed for modern development teams
            </motion.p>
          </motion.div>

          {/* Feature Cards */}
          <div className="space-y-32">
            {/* Special Layout for Real-time Code Editor */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-8"
            >
              <div className="text-center max-w-2xl mx-auto">
                <motion.div 
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.3 
                  }}
                  className="inline-block p-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 mb-6"
                >
                  <Code className="w-6 h-6" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-3xl font-bold text-white mb-4"
                >
                  Real-time Code Editor
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-gray-400 text-lg"
                >
                  Collaborate with your team in real-time with our powerful code editor. See changes instantly as you code together.
                </motion.p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 max-w-4xl mx-auto"
              >
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="absolute top-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500"
                />
                <img
                  src="/screenshots/codeOutput.png"
                  alt="Real-time Code Editor"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    console.error("Failed to load image: codeOutput.png");
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20" />
                
                {/* Animated dots */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute bottom-4 right-4 flex space-x-1"
                >
                  {[...Array(3)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 rounded-full bg-blue-400"
                      style={{ 
                        animationDelay: `${i * 0.3}s`,
                        opacity: 0.7
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Other Features */}
            {features.slice(1).map((feature, index) => {
  // Create parallax effect values for each feature
  const featureRef = useRef(null);
  
  return (
    <motion.div
      key={index}
      id={`feature-${index + 1}`}
      ref={el => {
        featureRefs.current[index] = el;
        if (index === 0) featureRef.current = el;
      }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`flex flex-col justify-around ${
        index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
      } items-center gap-12`}
    >
      <motion.div 
        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full lg:w-80"
      >
        <motion.div 
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.3 
          }}
          className={`inline-block p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-6`}
        >
          {feature.icon}
        </motion.div>
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-2xl font-bold text-white mb-4"
        >
          {feature.title}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-gray-400 text-lg"
        >
          {feature.description}
        </motion.p>
      </motion.div>
      
      <div className="w-full lg:w-80">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.5)"
          }}
          className="relative rounded-xl overflow-hidden shadow-2xl border border-white/10 max-w-lg mx-auto"
        >
          <motion.div
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className={`absolute top-0 h-1 bg-gradient-to-r ${feature.color}`}
          />
          <img
            src={feature.image}
            alt={feature.title}
            className="w-full h-auto object-cover"
            onError={(e) => {
              console.error(`Failed to load image: ${feature.image}`);
              e.target.style.display = 'none';
            }}
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20`} />
          
          {/* Interactive hover effect */}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/20 flex items-center justify-center"
          >
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
})}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-24 bg-gradient-to-t from-gray-900 to-gray-800 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Ready to Start Collaborating?</h2>
            <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">Join thousands of developers who are already using CodeSync to streamline their collaborative coding process.</p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block"
            >
              <button className="bg-blue-600 px-5 py-2 mx-5 rounded-md text-lg"  onClick={() => loginWithRedirect()}>Sign Up</button>

            </motion.div>
          </motion.div>
        </div>
        
        {/* Animated background elements */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 - 50 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0.1,
              scale: Math.random() * 1 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -100 + "%", null],
              rotate: [0, Math.random() * 360, 0],
              opacity: [0.1, Math.random() * 0.2 + 0.1, 0.1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: Math.random() * 20 + 15,
              ease: "easeInOut"
            }}
            className="absolute blur-xl rounded-full"
            style={{ 
              width: Math.random() * 300 + 100 + 'px', 
              height: Math.random() * 300 + 100 + 'px',
              background: `rgba(${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, ${Math.random() * 200 + 55}, 0.1)`
            }}
          />
        ))}
      </motion.div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-8 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 items-center"
        >
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">CodeSync</h1>
            <p className="text-sm mt-1 text-gray-400">
              Real-time coding. Anywhere. Anytime.
            </p>
          </div>

          <div className="flex flex-col space-y-2 text-sm">
            <span className="font-semibold text-white">Quick Links</span>
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">
              Contact
            </a>
          </div>

          <div className="flex flex-col items-start sm:items-end space-y-2 text-sm">
            <div className="flex space-x-4">
              <motion.a 
                whileHover={{ y: -3, color: "#60A5FA" }}
                href="https://github.com/aniketchawardol/CodeSync" 
                target="_blank" 
                className="hover:text-cyan-400 transition-colors"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -3, color: "#60A5FA" }}
                href="#" 
                className="hover:text-cyan-400 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a 
                whileHover={{ y: -3, color: "#60A5FA" }}
                href="#" 
                className="hover:text-cyan-400 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            </div>
            <p className="text-gray-500">
              © {new Date().getFullYear()} CodeSync. All rights reserved.
            </p>
          </div>
        </motion.div>
      </footer>
    </div>
  );
}

export default LoginPage;