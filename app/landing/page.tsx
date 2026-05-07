'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Pill, BarChart3, Users, Zap, Shield, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import CurrencySelector from '@/components/CurrencySelector';

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Pill,
      title: 'Medicine Management',
      description: 'Manage thousands of medicines with advanced search by type, strength, and company',
    },
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'Real-time sales reports and inventory analytics for better decisions',
    },
    {
      icon: Users,
      title: 'Customer Tracking',
      description: 'Build customer profiles and track purchase history effortlessly',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance with local caching for instant results',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Firebase-backed security with encrypted cloud backup',
    },
    {
      icon: Clock,
      title: 'Real-time Sync',
      description: 'Automatic syncing between local storage and cloud',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-sky-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Pill className="w-8 h-8 text-sky-600" />
              <h1 className="text-2xl font-bold text-sky-900">Real Pharmacy</h1>
            </div>
            <div className="flex gap-4">
              <CurrencySelector />
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="border-sky-200 text-sky-700 hover:bg-sky-50"
              >
                Login
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="bg-sky-600 hover:bg-sky-700 text-white"
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div
          className={`grid md:grid-cols-2 gap-12 items-center transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-sky-900 mb-6">
              Professional Pharmacy Management
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A powerful, fast, and intuitive system designed for real pharmacy businesses. Manage medicines, billing, inventory, and customers with ease.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/register')}
                className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 text-lg"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                className="border-sky-600 text-sky-600 hover:bg-sky-50 px-8 py-3 text-lg"
              >
                Watch Demo
              </Button>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <div className="bg-gradient-to-br from-sky-100 to-sky-50 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <Pill className="w-24 h-24 text-sky-600 mx-auto mb-4 animate-bounce" />
                <p className="text-sky-900 font-semibold">Pharmacy Management Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-sky-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-600">Everything you need to run a modern pharmacy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`p-8 rounded-lg border border-sky-100 hover:shadow-lg transition-all duration-500 hover:border-sky-300 transform hover:-translate-y-1 ${
                    isLoaded
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{
                    transitionDelay: `${idx * 100}ms`,
                  }}
                >
                  <Icon className="w-12 h-12 text-sky-600 mb-4" />
                  <h4 className="text-xl font-semibold text-sky-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-sky-600 to-sky-700 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10k+</div>
              <p className="text-sky-100">Active Pharmacies</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500k+</div>
              <p className="text-sky-100">Medicines Managed</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <p className="text-sky-100">Uptime</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <p className="text-sky-100">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-2xl p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Pharmacy?
          </h3>
          <p className="text-xl text-sky-100 mb-8">
            Join thousands of pharmacies using Real Pharmacy System
          </p>
          <Button
            onClick={() => router.push('/register')}
            className="bg-white text-sky-600 hover:bg-sky-50 px-8 py-3 text-lg font-semibold"
          >
            Start Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2024 Real Pharmacy System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
