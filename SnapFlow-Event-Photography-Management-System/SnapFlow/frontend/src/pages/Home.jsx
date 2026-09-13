import { Link } from 'react-router-dom';
import { Camera, Calendar, Users, Image, ArrowRight, CheckCircle, Package } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-dark-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-dark-900 to-dark-950" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-brand-400 mb-4">
              Lanka Moments Photography
            </p>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
              Capture Every Moment,<br />
              <span className="text-brand-400">Managed Beautifully</span>
            </h1>
            <p className="mt-6 text-lg text-dark-300 leading-relaxed max-w-xl">
              SnapFlow is the complete event photography management platform for Lanka Moments.
              Book packages, track your events, and access your private photo galleries — all in one place.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/packages" className="btn-primary text-base px-6 py-3">
                Browse Packages <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="btn-secondary bg-white/10 border-white/20 text-white hover:bg-white/20 text-base px-6 py-3">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display text-3xl font-bold text-dark-900">Everything you need</h2>
            <p className="mt-3 text-dark-500">From booking to final delivery — a seamless photography experience.</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Package, title: 'Browse Packages', desc: 'Explore wedding, corporate, and portrait packages tailored to your event.' },
              { icon: Calendar, title: 'Easy Booking', desc: 'Submit booking requests online and track status in real time.' },
              { icon: Users, title: 'Expert Photographers', desc: 'Our professional team is carefully assigned to every event.' },
              { icon: Image, title: 'Private Galleries', desc: 'Securely view and download your edited photographs online.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-soft transition-shadow">
                <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="font-semibold text-dark-900">{title}</h3>
                <p className="mt-2 text-sm text-dark-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-dark-900">Why Lanka Moments?</h2>
              <p className="mt-4 text-dark-500 leading-relaxed">
                With years of experience capturing Sri Lanka’s most precious moments, we combine
                artistic excellence with reliable service management through SnapFlow.
              </p>
              <ul className="mt-8 space-y-3">
                {['Professional certified photographers', 'Transparent pricing & packages', 'Secure online photo delivery', 'Dedicated customer support'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-dark-700">
                    <CheckCircle className="h-5 w-5 text-brand-600 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-primary mt-8 inline-flex">Learn more about us</Link>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-10 text-white shadow-soft">
              <Camera className="h-12 w-12 text-brand-200 mb-6" />
              <h3 className="font-display text-2xl font-bold">Ready to book?</h3>
              <p className="mt-3 text-brand-100 leading-relaxed">
                Create a free account, choose a package, and submit your event details in minutes.
              </p>
              <Link to="/register" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
