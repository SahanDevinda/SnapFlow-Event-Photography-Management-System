import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera, Calendar, ShieldCheck, ArrowRight, Image as ImageIcon,
  Sparkles, Layers, ExternalLink
} from 'lucide-react';
import { PackageCatalogueView } from '../../components/packages/PackageCatalogueView';

export const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative bg-charcoal-950 text-white overflow-hidden py-24 sm:py-36">
        {/* Dot-grid background */}
        <div className="absolute inset-0 opacity-[0.12] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:18px_18px]" />
        {/* Radial glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/25 text-gold-400 text-xs font-semibold uppercase tracking-wider mb-8">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            Lanka Moments &bull; Event Photography Excellence
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Timeless Moments,{' '}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-200 to-gold-500">
              Captivating Visual Artistry.
            </span>
          </h1>

          {/* Sub-copy */}
          <p className="mt-6 text-base sm:text-lg text-gray-300/90 max-w-2xl mx-auto font-normal leading-relaxed">
            From majestic weddings at Colombo's heritage venues to intimate milestone
            celebrations, Lanka Moments centralises booking, live scheduling, and
            private high-resolution photo deliveries in one seamless hub.
          </p>

          {/* ─── Three Hero CTA buttons ──────────────────────────── */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">

            {/* PRIMARY — Explore Packages */}
            <button
              onClick={() => navigate('/packages')}
              className="
                inline-flex items-center justify-center gap-2.5
                px-7 py-3.5 rounded-xl
                bg-gold-500 text-charcoal-950
                text-sm font-bold tracking-wide
                shadow-lg shadow-gold-500/20
                hover:bg-gold-400 active:bg-gold-600
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-charcoal-950
                w-full sm:w-auto
              "
            >
              <Layers className="w-4 h-4 shrink-0" />
              Explore Packages
            </button>

            {/* SECONDARY — Check Live Availability */}
            <button
              onClick={() => navigate('/availability')}
              className="
                inline-flex items-center justify-center gap-2.5
                px-7 py-3.5 rounded-xl
                bg-charcoal-900 text-white
                border border-gold-500/60
                text-sm font-semibold tracking-wide
                hover:bg-gold-500/10 hover:border-gold-400
                active:bg-gold-500/20
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-charcoal-950
                w-full sm:w-auto
              "
            >
              <Calendar className="w-4 h-4 shrink-0 text-gold-400" />
              <span>Check Live Availability</span>
            </button>

            {/* TERTIARY — Access Client Gallery */}
            <button
              onClick={() => navigate('/gallery-access')}
              className="
                inline-flex items-center justify-center gap-2
                px-5 py-3.5 rounded-xl
                text-gold-400 text-sm font-semibold
                hover:text-gold-300 hover:bg-gold-500/10
                active:bg-gold-500/20
                border border-transparent hover:border-gold-500/20
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 focus:ring-offset-charcoal-950
                w-full sm:w-auto
              "
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              Access Client Gallery
            </button>
          </div>

          {/* Trust micro-labels */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-gold-500/70" />Verified Deposits</span>
            <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5 text-gold-500/70" />High-Res Delivery</span>
            <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-gold-500/70" />Expert Crew</span>
          </div>
        </div>
      </section>

      {/* ─── TRUST / METRICS BANNER ─────────────────────────────── */}
      <section className="bg-charcoal-900 border-y border-gray-800 py-9 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '12+', label: 'Years Experience' },
            { value: '1,500+', label: 'Weddings & Events' },
            { value: '100%', label: 'Verified Hi-Res Deliveries' },
            { value: '4.9 / 5.0', label: 'Client Satisfaction' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-gold-400">{value}</div>
              <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── PACKAGES PREVIEW ───────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gold-600 mb-2">Our Signature Collections</h2>
          <h3 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Curated Photography Packages</h3>
          <p className="mt-3 text-sm text-gray-500">
            Transparent pricing in Sri Lankan Rupees. Flexible add-ons including drone
            cinematography and luxury flush-mount albums.
          </p>
        </div>

        <PackageCatalogueView
          onSelectPackage={(pkg) => navigate(`/customer/book?packageId=${pkg.id}`)}
          actionLabel="Book This Package"
        />
      </section>

      {/* ─── WHY CHOOSE LANKA MOMENTS ───────────────────────────── */}
      <section className="bg-white py-20 border-t border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gold-600 mb-2">Why Lanka Moments</h2>
            <h3 className="text-3xl font-extrabold text-gray-900">Craftsmanship &amp; Seamless Technology</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Calendar,
                title: 'Real-Time Availability',
                body: 'Check dates and request preferred lead photographers instantly without waiting days for email quotes or telephone calls.'
              },
              {
                icon: ShieldCheck,
                title: 'Transparent Finance',
                body: 'Upload real bank slips, track verified receipts, and receive timely in-app balance reminders 14 days before your event.'
              },
              {
                icon: ImageIcon,
                title: 'Private Proof Selection',
                body: 'Review proofs online, select your album favorites, and download the entire final published gallery as a ZIP package.'
              }
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="p-6 rounded-2xl bg-[#F9F9FB] border border-gray-200/70">
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 text-gold-600 flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─────────────────────────────────────────── */}
      <section className="bg-charcoal-950 text-white py-16 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to secure photography for your special date?
          </h2>
          <p className="text-sm text-gray-400 mb-8 max-w-xl mx-auto">
            Book now with a verified advance deposit or contact our Customer Relations
            Officers for custom requests.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => navigate('/packages')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gold-500 text-charcoal-950 text-sm font-bold hover:bg-gold-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              <Layers className="w-4 h-4" />
              Browse All Packages
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-charcoal-900 border border-gray-700 text-white text-sm font-semibold hover:border-gold-500/50 hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
