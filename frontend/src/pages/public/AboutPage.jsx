import React from 'react';
import { Camera, Award, Users, Heart } from 'lucide-react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';

export const AboutPage = () => {
  return (
    <div className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: 'About Us' }]} />

      <div className="text-center max-w-2xl mx-auto mb-14">
        <h1 className="text-4xl font-extrabold text-gray-900">About Lanka Moments (Pvt) Ltd</h1>
        <p className="mt-3 text-sm text-gray-500">
          Premier event photography and visual media production company headquartered in Colombo, Sri Lanka.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6 text-sm text-gray-600 leading-relaxed mb-12">
        <h2 className="text-xl font-bold text-gray-900">Our Story & Craft</h2>
        <p>
          Founded in Colombo, Lanka Moments (Pvt) Ltd has grown into one of Sri Lanka’s most trusted names in luxury wedding, corporate summit, and lifestyle event photography. We combine traditional warmth with world-class cinema equipment and digital workflows.
        </p>
        <p>
          SnapFlow was designed as our centralized university software engineering enterprise platform to guarantee zero double-bookings, complete price transparency in Sri Lankan Rupees, rigorous equipment accountability, and direct private delivery of high-resolution digital albums.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
          <Award className="w-8 h-8 text-gold-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Artistic Excellence</h3>
          <p className="text-xs text-gray-500">Top-tier color grading, candid captures, and archival-grade albums.</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
          <Users className="w-8 h-8 text-gold-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Dedicated Team</h3>
          <p className="text-xs text-gray-500">Certified lead photographers, lighting technicians, and dedicated CRO staff.</p>
        </div>
        <div className="p-6 bg-white rounded-xl border border-gray-200 text-center">
          <Heart className="w-8 h-8 text-gold-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 mb-1">Client Centric</h3>
          <p className="text-xs text-gray-500">Full control over proof photo selection, transparent payments, and change management.</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
