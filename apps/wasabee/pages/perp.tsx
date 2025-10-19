import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { NextLayoutPage } from '@/types/nextjs';

const PerpPage: NextLayoutPage = observer(() => {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = () => {
    // Placeholder validation - all codes are rejected for now
    setError('Oops, wrong code');
    setIsShaking(true);

    // Reset shake animation after it completes
    setTimeout(() => {
      setIsShaking(false);
    }, 500);
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default PerpPage;
