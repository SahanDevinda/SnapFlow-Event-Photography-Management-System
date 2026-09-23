import React from 'react';
import { Camera, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-charcoal-950 text-gray-400 border-t border-gray-800 pt-12 pb-8 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 flex items-center justify-center border border-gold-500/40">
              <Camera className="w-4 h-4 text-gold-400" />
            </div>
            <span className="font-bold text-lg text-white">SNAP<span className="text-gold-400">FLOW</span></span>
          </div>
          <p className="text-xs leading-relaxed text-gray-400">
            Official event photography management platform for Lanka Moments (Pvt) Ltd. Preserving Sri Lanka's finest memories with artistic precision.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/packages" className="hover:text-gold-400 transition">Photography Packages</Link></li>
            <li><Link to="/availability" className="hover:text-gold-400 transition">Check Date Availability</Link></li>
            <li><Link to="/gallery-access" className="hover:text-gold-400 transition">Access Client Gallery</Link></li>
            <li><Link to="/about" className="hover:text-gold-400 transition">About Our Team</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Services</h4>
          <ul className="space-y-2 text-xs">
            <li>Wedding Ceremonies & Receptions</li>
            <li>Corporate Conferences & Summits</li>
            <li>Engagements & Pre-Shoots</li>
            <li>Birthdays & Milestone Celebrations</li>
            <li>Studio & Outdoor Portraits</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">Lanka Moments (Pvt) Ltd</h4>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
              <span>124 Galle Road, Colombo 03, Sri Lanka</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-400 shrink-0" />
              <span>+94 11 234 5678</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold-400 shrink-0" />
              <span>info@lankamoments.lk</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs">
        <p>&copy; {new Date().getFullYear()} Lanka Moments (Pvt) Ltd. All rights reserved. SE2030 Software Engineering.</p>
        <p className="mt-2 sm:mt-0 text-gray-500">Colombo, Sri Lanka</p>
      </div>
    </footer>
  );
};

export default Footer;
