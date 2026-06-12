import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import LoanCalculator from "../LoanCalculator";
import { DollarSign, Clock, Shield, Users, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import axiosInstance from "../../config/axios";
import { useAuth } from '../../contexts/AuthContext';
import TestimonialForm from '../../components/TestimonialForm';

const carouselImages = [
  "https://images.unsplash.com/photo-1560523159-4a9692d2c6a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const Home = () => {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loadingTestimonials, setLoadingTestimonials] = useState(true); // ✅ declared
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTestimonials = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  useEffect(() => {
  fetchTestimonials();
}, [refreshTrigger]);


  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Auto carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch testimonials when component mounts or refreshTrigger changes
  useEffect(() => {
    fetchTestimonials();
  }, [refreshTrigger]);

  const fetchTestimonials = async () => {
    setLoadingTestimonials(true);
    try {
      const response = await axiosInstance.get('/api/testimonials');
      // Backend returns a plain array
      setTestimonials(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const fetchCryptoPrices = async () => {
    try {
      const response = await axiosInstance.get("/api/crypto/prices");
      setCryptoPrices(response.data || {});
    } catch (error) {
      console.error("Error fetching crypto prices:", error);
      setCryptoPrices({});
    }
  };

  useEffect(() => {
    fetchCryptoPrices();
  }, []);

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  // Scroll animations refs
  const featuresRef = useRef(null);
  const calculatorRef = useRef(null);
  const cryptoRef = useRef(null);
  const testimonialsRef = useRef(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const calculatorInView = useInView(calculatorRef, { once: true });
  const cryptoInView = useInView(cryptoRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 dark:text-white">Sedgwiick</div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Register
              </Link>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <div className="relative h-[90vh] min-h-[600px] overflow-hidden">
        {carouselImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-black/50" />
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full backdrop-blur-sm transition z-10"
        >
          <ChevronLeft size={28} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full backdrop-blur-sm transition z-10"
        >
          <ChevronRight size={28} />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">Get Funding Instantly</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl drop-shadow-md">
            Secure loans from $100,000 to $100,000,000 with flexible repayment plans.<br />
            Fast approval, friendly.
          </p>
          <Link
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-full font-semibold shadow-xl transition transform hover:scale-105"
          >
            Apply for a Loan →
          </Link>
          <div className="mt-12 flex space-x-2">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-3 h-3 rounded-full transition-all ${
                  idx === currentImageIndex ? "bg-white w-6" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial="hidden"
        animate={featuresInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors"
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: DollarSign, title: "Competitive Rates", desc: "Rates from 7% to 15% depending on term length" },
              { icon: Clock, title: "Quick Approval", desc: "Get approved within 90 days and withdraw to your wallet" },
              { icon: Shield, title: "Secure Platform", desc: "Your data and transactions are fully protected" },
              { icon: Users, title: "24/7 Support", desc: "Dedicated customer support team" }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="text-center group"
              >
                <div className="bg-blue-100 dark:bg-blue-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition">
                  <item.icon className="text-blue-600 dark:text-blue-400" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-2 dark:text-white">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Loan Calculator */}
      <motion.section
        ref={calculatorRef}
        initial="hidden"
        animate={calculatorInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-16 bg-white dark:bg-gray-900 transition-colors"
      >
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <LoanCalculator />
          </div>
        </div>
      </motion.section>

      {/* Crypto Market Prices */}
      <motion.section
        ref={cryptoRef}
        initial="hidden"
        animate={cryptoInView ? "visible" : "hidden"}
        variants={fadeInUp}
        className="py-16 bg-gray-900 dark:bg-black text-white transition-colors"
      >
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-8">Today's Crypto Market</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {Object.entries(cryptoPrices).map(([coin, data]) => (
              <motion.div
                key={coin}
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transition"
              >
                <h3 className="text-xl font-bold capitalize mb-2 text-gray-800 dark:text-white">{coin}</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  ${data.usd?.toLocaleString()}
                </p>
                <p className={`text-sm font-semibold mt-2 ${data.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                  24h Change: {data.change24h?.toFixed(2)}%
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

{/* Testimonials Section */}
     {testimonials.map((testimonial) => (
  <motion.div
    key={testimonial._id}
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md hover:shadow-xl transition border border-gray-100 dark:border-gray-700 flex flex-col"
  >
    <div className="flex items-center mb-4">
      <div className="text-yellow-400 text-lg">
        {"★".repeat(testimonial.rating)}{"☆".repeat(5 - testimonial.rating)}
      </div>
    </div>
    <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow">"{testimonial.content}"</p>
    <div className="border-t dark:border-gray-700 pt-3 mt-2">
      <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
      {testimonial.loanAmount > 0 && (
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
          Loan: ${testimonial.loanAmount.toLocaleString()}
        </p>
      )}
    </div>
  </motion.div>
))}
      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-10 transition-colors">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2026 Sedgwick. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Built for financial freedom. Secure, transparent, fast.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;