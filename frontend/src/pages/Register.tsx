import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import registerBg from '../assets/images/register-bg.png';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password match
    if (name === 'password' || name === 'confirmPassword') {
      if (formData.password !== value && name === 'confirmPassword') {
        setPasswordsMatch(false);
      } else if (formData.confirmPassword !== value && name === 'password') {
        setPasswordsMatch(false);
      } else {
        setPasswordsMatch(true);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in store
    }
  };

  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { strength: 0, label: '', color: 'gray' };
    if (pwd.length < 6) return { strength: 1, label: 'Weak', color: 'red' };
    if (pwd.length < 10) return { strength: 2, label: 'Fair', color: 'orange' };
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { strength: 4, label: 'Strong', color: 'green' };
    }
    return { strength: 3, label: 'Good', color: 'yellow' };
  };

  const strength = getPasswordStrength();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${registerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark Overlay for Better Text Visibility */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
           {/* Animated Overlay Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-red-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>


      <div className="relative z-10 w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mb-4 shadow-lg">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ContentAI
            </h1>
            <p className="text-gray-600 mt-2 font-medium">Create Your Account & Start Creating</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-slideIn">
              <div className="text-red-500 text-xl mt-0.5">⚠️</div>
              <div className="flex-1">
                <p className="text-red-700 font-semibold text-sm">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 font-bold text-lg ml-2 transition"
              >
                ✕
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  👤 First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="John"
                  className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 font-medium placeholder-gray-400 ${
                    focusedField === 'firstName' ? 'border-purple-500 scale-105' : 'border-gray-200'
                  }`}
                  required
                />
              </div>

              <div className="relative group">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                  👤 Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Doe"
                  className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 font-medium placeholder-gray-400 ${
                    focusedField === 'lastName' ? 'border-purple-500 scale-105' : 'border-gray-200'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 font-medium placeholder-gray-400 ${
                  focusedField === 'email' ? 'border-purple-500 scale-105' : 'border-gray-200'
                }`}
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                🔐 Password
              </label>
              <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-105' : ''}`}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 font-medium placeholder-gray-400 pr-12 ${
                    focusedField === 'password' ? 'border-purple-500' : 'border-gray-200'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition text-lg"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${
                          level <= strength.strength
                            ? `bg-${strength.color}-500`
                            : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className={`text-xs font-semibold text-${strength.color}-600`}>
                    Password Strength: {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                🔐 Confirm Password
              </label>
              <div className={`relative transition-all duration-300 ${focusedField === 'confirmPassword' ? 'scale-105' : ''}`}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 bg-gray-50 border-2 rounded-lg focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none transition-all duration-300 font-medium placeholder-gray-400 pr-12 ${
                    focusedField === 'confirmPassword'
                      ? 'border-purple-500'
                      : passwordsMatch && formData.confirmPassword
                      ? 'border-green-500'
                      : !passwordsMatch && formData.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-200'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition text-lg"
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <p
                  className={`text-xs font-semibold mt-2 ${
                    passwordsMatch ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <label className="flex items-start gap-3 py-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded accent-purple-600 mt-1" required />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition">
                I agree to the{' '}
                <a href="#" className="text-purple-600 hover:underline font-semibold">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-600 hover:underline font-semibold">
                  Privacy Policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !passwordsMatch}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating Account...
                </>
              ) : (
                <>
                  <span>🎉</span>
                  Sign Up
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6 pt-6 border-t border-gray-100">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-600 hover:text-purple-700 font-bold transition underline-offset-2 hover:underline"
            >
              Log In Here
            </Link>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};
