import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { NextLayoutPage } from '@/types/nextjs';
import { trpcClient } from '@/lib/trpc';
import { WrappedToastify } from '@/lib/wrappedToastify';

const PerpPage: NextLayoutPage = observer(() => {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check URL parameter to auto-open waitlist modal
  useEffect(() => {
    if (router.query.waitlist === 'true' || router.query.join === 'waitlist') {
      setShowWaitlistModal(true);
    }
  }, [router.query]);

  const handleSubmit = () => {
    // Placeholder validation - all codes are rejected for now
    setError('Oops, wrong code');
    setIsShaking(true);

    // Reset shake animation after it completes
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
  };

  const handleEmailSubmit = async () => {
    if (email && email.includes('@')) {
      setIsSubmitting(true);
      try {
        const result = await trpcClient.userContacts.submitWaitlist.mutate({
          email,
        });

        if (result.success) {
          console.log('Email submitted successfully:', result);
          setEmailSubmitted(true);

          // Show success toast
          WrappedToastify.success({
            title: 'Welcome to the waitlist!',
            message: "We'll notify you when our Perp DEX launches.",
          });

          // Close modal after 2 seconds
          setTimeout(() => {
            setShowWaitlistModal(false);
            setEmail('');
            setEmailSubmitted(false);
          }, 2000);
        }
      } catch (error: any) {
        console.error('Error submitting email:', error);

        // Show error toast
        WrappedToastify.error({
          title: 'Failed to join waitlist',
          message: error.message || 'Please try again later.',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
      <div className="w-full flex items-center justify-center pb-6 sm:pb-12 pt-8 min-h-[calc(100vh-200px)]">
        <div className="w-full xl:mx-auto xl:max-w-[1200px] 2xl:max-w-[1500px] px-2 sm:px-4 md:px-8 xl:px-0">
          <div className="w-full bg-[#140D06] rounded-2xl border border-[#2a2318] p-8 sm:p-12">
            <div className="max-w-md mx-auto text-center">
              {/* Header */}
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Perpetual Trading
              </h1>
              <p className="text-gray-400 mb-8">
                Enter your invite code to access perpetual trading features
              </p>

              {/* Invite Code Input */}
              <div className="mb-6">
                <label
                  htmlFor="invite-code"
                  className="block text-left text-sm font-medium text-gray-300 mb-2"
                >
                  Invite Code
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    setInviteCode(e.target.value);
                    setError(''); // Clear error when user types
                  }}
                  placeholder="Enter your invite code"
                  className="w-full px-4 py-3 bg-[#1A0F06] border border-[#2a2318] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#6B4423] transition-colors"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className={`w-full px-6 py-3 bg-[#6B4423] hover:bg-[#7D4F28] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isShaking ? 'animate-shake' : ''
                }`}
                disabled={!inviteCode}
              >
                Continue
              </button>

              {/* Error Message */}
              {error && (
                <p className="mt-4 text-red-500 text-sm font-medium">{error}</p>
              )}

              {/* Waitlist Button */}
              <div className="mt-6 pt-6 border-t border-[#2a2318]">
                <p className="text-gray-400 text-sm mb-3">
                  Don&apos;t have a code?
                </p>
                <button
                  onClick={() => setShowWaitlistModal(true)}
                  className="text-[#D4A574] hover:text-[#E5B685] font-medium text-sm transition-colors underline"
                >
                  Join the waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowWaitlistModal(false)}
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-lg bg-[#140D06] rounded-3xl border-2 border-[#F59E0B] p-8 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowWaitlistModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header Image Section */}
            <div className="mb-6">
              <div className="relative bg-[#2A3545] rounded-2xl overflow-hidden">
                {/* Character Image */}
                <div className="w-full">
                  <img
                    src="/images/perp/perp-character.jpeg"
                    alt="Perp Character"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-[#F7931A] mb-3">
              Join our waitlist for early access to our{' '}
              <span className="text-[#FCD729]">Perp dex!</span>
            </h2>

            {/* Subtitle */}
            <p className="text-[#E7CDB1] text-sm mb-6">
              Get notified when our perpetual trading feature drops! Plus stay
              up to date with the latest news!
            </p>

            {emailSubmitted ? (
              <div className="text-center py-8">
                <div className="text-green-500 text-lg font-medium mb-2">
                  ✓ Thank you for joining!
                </div>
                <p className="text-gray-400 text-sm">
                  We&apos;ll be in touch soon.
                </p>
              </div>
            ) : (
              <>
                {/* Email Input */}
                <div className="mb-6">
                  <label
                    htmlFor="waitlist-email"
                    className="block text-sm font-black text-[#E7CDB1] mb-2"
                  >
                    Enter email
                  </label>
                  <input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="youremail@gmail.com"
                    className="w-full px-4 py-3 bg-[#1A0F06] font-black border border-[#2a2318] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-[#F59E0B] transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleEmailSubmit}
                  disabled={!email || !email.includes('@') || isSubmitting}
                  className="w-full px-6 py-4 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-black font-bold rounded-[2rem] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? 'Submitting...' : 'Get notified'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
});

export default PerpPage;
