import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Mail, Phone, MapPin, Github, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    about: [
      { label: 'How It Works', to: '/#how-it-works' },
      { label: 'Features', to: '/#features' },
      { label: 'Survey Insights', to: '/#survey-insights' },
      { label: 'FAQ', to: '/#faq' },
    ],
    quickLinks: [
      { label: 'Search Items', to: '/search' },
      { label: 'Report Lost Item', to: '/report-lost' },
      { label: 'Report Found Item', to: '/report-found' },
      { label: 'Track Claims', to: '/profile' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Twitter, href: '#', label: 'X (Twitter)' },
  ];

  return (
    <footer className="bg-[#0B1F3A] border-t border-[#1E3A5F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 group mb-4">
              <div className="w-10 h-10 overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="FoundIt Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight leading-none">
                  FoundIt
                </span>
                <span className="text-xs font-medium text-[#14B8A6] uppercase tracking-wider mt-1">
                  Campus Lost & Found
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed mb-6 font-medium">
              Find. Report. Reconnect.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-9 h-9 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-gray-300 hover:bg-[#14B8A6] hover:text-white transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* About links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              About
            </h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-300 hover:text-[#14B8A6] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-300 hover:text-[#14B8A6] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                +91 80 26622130
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-[#14B8A6] flex-shrink-0" />
                <a href="mailto:lostandfound@campusconnect.edu" className="hover:text-[#14B8A6] transition-colors">
                  lostandfound@campusconnect.edu
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-[#14B8A6] flex-shrink-0 mt-0.5" />
                <span>
                  P.O. Box No. 1908,<br />
                  Bull Temple Road,<br />
                  Basavanagudi,<br />
                  Bengaluru – 560019,<br />
                  Karnataka, India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-[#1E3A5F] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © 2026 CampusConnect Lost & Found. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
