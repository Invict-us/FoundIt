import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, animate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, Search, Bell, Map, Zap, CheckCircle2, Clock, MapPin, Star, Quote, Award } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

function AnimatedCounter({ value, duration = 2 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      onUpdate(val) {
        setCount(Math.floor(val));
      }
    });
    return () => controls.stop();
  }, [value, duration]);

  return <>{count}</>;
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  const [stats, setStats] = useState({
    reported: 0,
    recovered: 0,
    recoveryRate: 0,
    active: 0
  });

  useEffect(() => {
    setStats({
      reported: 245,
      recovered: 198,
      recoveryRate: 81,
      active: 47
    });
  }, []);

  const recentRecoveries = [
    { name: 'ID Card', location: 'Near Library', time: 'Recovered in 2 Days', icon: '💳' },
    { name: 'Calculator', location: 'CSE Block', time: 'Recovered in 1 Day', icon: '🔢' },
    { name: 'Wallet', location: 'Food Court', time: 'Recovered in 3 Hours', icon: '👛' },
  ];

  const testimonials = [
    { text: "I lost my ID card near the library and got it back within 24 hours.", author: "Rahul, CSE", avatar: "👨‍🎓" },
    { text: "I recovered my calculator before my exam. Thank you Lost and Found System!", author: "Ananya, ECE", avatar: "👩‍🎓" },
    { text: "I found my wallet through the Lost and Found System notification system.", author: "Priya, MBA", avatar: "👩‍💼" }
  ];

  const popularLocations = [
    { name: 'Library', intensity: 95 },
    { name: 'Food Court', intensity: 80 },
    { name: 'Hostel', intensity: 65 },
    { name: 'CSE Block', intensity: 85 },
    { name: 'Auditorium', intensity: 40 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1F3A] via-slate-900 to-[#14B8A6]/20 dark:from-slate-950 dark:via-slate-900 dark:to-teal-950 z-0"></div>
        
        <motion.div style={{ y: y1 }} className="absolute top-20 left-20 w-64 h-64 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></motion.div>
        <motion.div style={{ y: y2 }} className="absolute top-40 right-20 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></motion.div>
        <motion.div style={{ y: y1 }} className="absolute -bottom-20 left-1/2 w-80 h-80 bg-[#1E3A5F] rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 text-sm font-semibold mb-6 shadow-sm">
              ✨ The Smart Campus Platform
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
              Never Lose What <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-sky-400">Matters</span>
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Lost and Found System is a smart campus lost-and-found platform that helps students, faculty, and staff quickly report, search, match, and recover lost belongings through a centralized digital system.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/report-lost">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4 bg-[#14B8A6] hover:bg-teal-500 text-white border-none shadow-lg shadow-teal-500/20 rounded-xl transition-all hover:-translate-y-1">
                  Report Lost Item
                </Button>
              </Link>
              <Link to="/report-found">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 text-white border-white/30 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all hover:-translate-y-1">
                  Report Found Item
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURE 1: FOUNDIT IMPACT DASHBOARD */}
      <section className="py-16 relative z-10 -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { label: 'Items Reported', value: stats.reported, suffix: '', icon: <Search className="w-5 h-5 text-sky-500" /> },
              { label: 'Items Recovered', value: stats.recovered, suffix: '', icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
              { label: 'Recovery Rate', value: stats.recoveryRate, suffix: '%', icon: <Zap className="w-5 h-5 text-amber-500" /> },
              { label: 'Active Reports', value: stats.active, suffix: '', icon: <Bell className="w-5 h-5 text-indigo-500" /> }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card glass className="p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/40 dark:border-slate-700/50 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-none transition-transform hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700/50">
                      {stat.icon}
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-extrabold text-[#1E3A5F] dark:text-white mb-1">
                    <AnimatedCounter value={stat.value} />{stat.suffix}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURE 2: RECENT RECOVERIES */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] dark:text-white mb-4">
              Recently Recovered
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Real-time success stories from our campus community.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {recentRecoveries.map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <Card className="p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider">Success</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1E3A5F] dark:text-white mb-2">{item.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> {item.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 font-medium">
                    <Clock className="w-4 h-4" /> {item.time}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE 5: POPULAR LOST LOCATIONS */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] dark:text-white mb-6">
                Lost Something? Check These Hotspots
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Based on our platform's analytics, we've identified the most common locations where items are misplaced on campus. Always check these areas first!
              </p>
              <div className="space-y-6">
                {popularLocations.map((loc, idx) => (
                  <div key={idx} className="relative">
                    <div className="flex justify-between text-sm font-semibold mb-2">
                      <span className="text-[#1E3A5F] dark:text-white">{loc.name}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${loc.intensity}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut", delay: idx * 0.1 }}
                        className={`h-full rounded-full ${idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-orange-500' : idx === 2 ? 'bg-amber-500' : 'bg-teal-500'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]"></div>
              <Map className="w-32 h-32 text-slate-200 dark:text-slate-700 absolute" />
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-4 animate-bounce shadow-lg shadow-teal-500/20">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] dark:text-white">Campus Heatmap</h3>
                <p className="text-sm text-slate-500 mt-2">Interactive map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE 3: SUCCESS STORIES */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E3A5F] dark:text-white mb-4">
              Community Success Stories
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                <Card className="p-8 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                  <Quote className="w-8 h-8 text-teal-500/30 mb-4" />
                  <p className="text-slate-600 dark:text-slate-300 italic mb-6">"{t.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-2xl shadow-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E3A5F] dark:text-white">{t.author}</h4>
                      <div className="flex text-amber-400">
                        <Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" /><Star className="w-4 h-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center bg-gradient-to-br from-[#0B1F3A] to-[#14B8A6] border-none rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to find what you've lost?
              </h2>
              <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-10">
                Join thousands of students securely recovering their belongings on campus every day with Lost and Found System.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/register">
                  <Button variant="white" size="lg" className="w-full sm:w-auto text-lg px-8 rounded-xl shadow-lg text-[#1E3A5F]">
                    Create an Account
                  </Button>
                </Link>
                <Link to="/search">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 text-lg px-8 rounded-xl backdrop-blur-sm">
                    Search Items
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
