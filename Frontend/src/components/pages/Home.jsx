import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import LoanCalculator from "../LoanCalculator";
import { DollarSign, Clock, Shield, Users, ChevronLeft, ChevronRight, Star, MessageSquareQuote, Calculator } from "lucide-react";
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
  const [loadingTestimonials, setLoadingTestimonials] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshTestimonials = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  useEffect(() => {
  fetchTestimonials();
}, [refreshTrigger]);

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
      setTestimonials(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoadingTestimonials(false);
    }
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  // Scroll animations refs
  const avatarGradients = [
    'from-blue-500 to-cyan-400',
    'from-violet-500 to-purple-400',
    'from-emerald-500 to-teal-400',
    'from-rose-500 to-pink-400',
    'from-amber-500 to-orange-400',
    'from-indigo-500 to-blue-400',
  ]

  const featuresRef = useRef(null);
  const calculatorRef = useRef(null);
  const testimonialsRef = useRef(null);

  const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" });
  const calculatorInView = useInView(calculatorRef, { once: true });
  const testimonialsInView = useInView(testimonialsRef, { once: true });

  return (
    <div className="landing-page min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">Velaris</div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <div className="relative h-[85vh] sm:h-[90vh] min-h-[550px] sm:min-h-[600px] overflow-hidden">
        {carouselImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              idx === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <button
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 z-10 hover:scale-110"
        >
          <ChevronLeft size={22} className="sm:size-[28]" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white p-2.5 sm:p-3 rounded-full backdrop-blur-md border border-white/20 transition-all duration-300 z-10 hover:scale-110"
        >
          <ChevronRight size={22} className="sm:size-[28]" />
        </button>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 sm:px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium mb-6 sm:mb-8 tracking-wide"
          >
            <div className="size-2 bg-emerald-400 rounded-full animate-pulse" />
            Trusted by 10,000+ clients worldwide
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight sm:leading-tight drop-shadow-2xl max-w-4xl"
          >
            Get Funding{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
              Instantly
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl mt-4 sm:mt-6 mb-14 sm:mb-20 max-w-2xl sm:max-w-3xl drop-shadow-lg text-white/90 leading-relaxed"
          >
            Secure loans from $100,000 to $100,000,000 with flexible repayment plans.
            Fast approval, transparent terms, dedicated support.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
            className="flex flex-col sm:flex-row items-center gap-5 mt-5 sm:gap-6"
          >
            <Link
              to="/register"
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm sm:text-base px-7 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105 active:scale-100 overflow-hidden"
            >
              <span className="relative z-10">Apply for a Loan</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform duration-200">→</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transition-transform duration-700" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/25 text-white text-sm sm:text-base px-6 sm:px-7 py-3 sm:py-3.5 rounded-full font-medium transition-all duration-300 hover:scale-105 active:scale-100"
            >
              Sign In
              <ChevronRight size={16} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 sm:mt-14 flex items-center gap-4 sm:gap-6 text-white/60 text-xs sm:text-sm"
          >
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 bg-emerald-400 rounded-full" />
              No hidden fees
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 bg-emerald-400 rounded-full" />
              90-day approval
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 bg-emerald-400 rounded-full" />
              Fixed rates
            </div>
          </motion.div>

          <div className="mt-8 sm:mt-10 flex items-center gap-2.5">
            {carouselImages.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`rounded-full transition-all duration-500 ${
                  idx === currentImageIndex
                    ? "bg-white w-8 sm:w-10 h-2.5"
                    : "bg-white/30 hover:bg-white/50 w-2.5 h-2.5"
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
        className="py-20 bg-gray-50"
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
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition">
                  <item.icon className="text-blue-600" size={36} />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
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
        className="py-20 sm:py-24 bg-gradient-to-b from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

        <div className="container mx-auto px-6 relative">
          <motion.div variants={fadeInUp} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-300 px-4 py-1.5 rounded-full text-sm font-medium mb-4 border border-blue-400/20">
              <Calculator className="size-4" />
              Loan Calculator
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Plan Your Loan</h2>
            <p className="text-lg text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              See exactly what you'll pay with our transparent calculator. No hidden fees, no surprises.
            </p>
          </motion.div>
          <motion.div variants={fadeInUp} className="max-w-2xl mx-auto">
            <LoanCalculator />
          </motion.div>
        </div>
      </motion.section>

{/* Testimonials Section */}
      <motion.section
        ref={testimonialsRef}
        initial="hidden"
        animate={testimonialsInView ? "visible" : "hidden"}
        variants={staggerContainer}
        className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50"
      >
        <div className="container mx-auto px-6">
          <motion.div variants={fadeInUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <MessageSquareQuote className="size-4" />
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Hear from our valued clients about their experience with Velaris.
            </p>
          </motion.div>

          {loadingTestimonials ? (
            <div className="flex justify-center py-16">
              <div className="size-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <MessageSquareQuote className="size-12 mx-auto mb-4 opacity-40" />
              <p className="text-lg">No testimonials yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={testimonial._id}
                  variants={fadeInUp}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="group relative bg-white rounded-2xl p-7 shadow-md hover:shadow-xl border border-gray-100/80 transition-all duration-300 flex flex-col"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start gap-4 mb-5">
                    <div className={`size-14 rounded-full bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]} flex items-center justify-center shrink-0 shadow-md`}>
                      <span className="text-white font-bold text-xl">{testimonial.author.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{testimonial.author}</p>
                      {testimonial.loanAmount > 0 && (
                        <p className="text-xs text-blue-600 font-medium mt-0.5">${testimonial.loanAmount.toLocaleString()} loan</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-0.5 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-4 ${star <= testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 leading-relaxed flex-grow text-sm">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className="size-1.5 rounded-full bg-amber-400" />
                        <div className="size-1.5 rounded-full bg-amber-400" />
                        <div className="size-1.5 rounded-full bg-amber-400" />
                      </div>
                      <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">Verified Client</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {user && (
            <motion.div variants={fadeInUp} className="mt-14 max-w-lg mx-auto">
              <TestimonialForm onSuccess={refreshTestimonials} />
            </motion.div>
          )}
        </div>
      </motion.section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="container mx-auto px-6 text-center">
          <p>&copy; 2026 Velaris. All rights reserved.</p>
          <p className="text-sm text-gray-400 mt-2">Built for financial freedom. Secure, transparent, fast.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;