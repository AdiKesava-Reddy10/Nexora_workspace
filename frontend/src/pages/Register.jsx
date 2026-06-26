import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, ShieldAlert, ArrowRight, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
// Yes, the file is context/NotificationContext.jsx. Let's import correctly from '../context/NotificationContext'.

export const Register = () => {
  const { register, user } = useAuth();
  // Wait, let's use the correct notification hook!
  // I will import useNotifications from '../context/NotificationContext'
  // Let's write the import correctly.
  
  const navigate = useNavigate();

  // Multi-step form management
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  
  const [profession, setProfession] = useState('Developer');
  const [organization, setOrganization] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('Entry-Level (0-2 yrs)');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('Developer'); // mapped user type: Admin, Project Manager, Team Lead, Developer, Student, Freelancer, Viewer

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('Please enter your name, email address, and password.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please verify your entries.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters long.');
        return;
      }
    }
    setErrorMsg('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    const additionalFields = {
      phone,
      profession,
      organization,
      skills,
      bio,
      avatar,
      experience
    };

    try {
      await register(name, email, password, role, additionalFields);
      // Let's print alert directly to avoid importing issues
      alert('Account registered successfully! Welcome to Nexora Workspace.');
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Email might be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080512] flex items-center justify-center p-4 relative font-sans">
      
      {/* Background blobs */}
      <div className="aurora-bg">
        <div className="absolute top-[20%] left-[20%] w-[320px] h-[320px] bg-brand-500/10 rounded-full aurora-blob animate-aurora" />
        <div className="absolute bottom-[30%] right-[35%] w-[380px] h-[380px] bg-indigo-600/10 rounded-full aurora-blob animate-aurora" style={{ animationDelay: '-4s' }} />
      </div>

      <div className="w-full max-w-lg glass-panel p-8 border border-white/20 shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/20">
            N
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Workspace Account</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Step {step} of 3: {step === 1 ? 'Credentials' : step === 2 ? 'Professional' : 'About You'}
            </p>
          </div>
        </div>

        {/* Errors display */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/5 text-rose-300 text-xs flex items-center gap-2.5 animate-pulse-slow">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : handleNextStep} className="flex flex-col gap-4">
          
          {/* STEP 1: Basic credentials */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">FULL NAME</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    required
                    type="text"
                    placeholder="Alex Carter"
                    className="glass-input pl-10 text-sm w-full bg-slate-900/30 text-white"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                  <input
                    required
                    type="email"
                    placeholder="alex@company.com"
                    className="glass-input pl-10 text-sm w-full bg-slate-900/30 text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PASSWORD</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="glass-input pl-10 pr-10 text-sm w-full bg-slate-900/30 text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CONFIRM PASSWORD</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                    <input
                      required
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="glass-input pl-10 pr-10 text-sm w-full bg-slate-900/30 text-white"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PHONE NUMBER</label>
                <input
                  type="text"
                  placeholder="+1 (555) 123-4567"
                  className="glass-input text-sm bg-slate-900/30 text-white"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Professional specs */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PROFESSION / TITLE</label>
                  <select
                    className="glass-input text-sm bg-slate-900/30 text-white cursor-pointer select-none"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                  >
                    <option value="Developer" className="bg-[#0f0c1b] text-white">Software Engineer</option>
                    <option value="Product Manager" className="bg-[#0f0c1b] text-white">Product Manager</option>
                    <option value="UI UX Designer" className="bg-[#0f0c1b] text-white">UI/UX Designer</option>
                    <option value="Student" className="bg-[#0f0c1b] text-white">Student</option>
                    <option value="Faculty" className="bg-[#0f0c1b] text-white">Faculty / Professor</option>
                    <option value="Startup Founder" className="bg-[#0f0c1b] text-white">Startup Founder</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">USER TYPE ROLE</label>
                  <select
                    className="glass-input text-sm bg-slate-900/30 text-white cursor-pointer select-none"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Developer" className="bg-[#0f0c1b] text-white">Developer</option>
                    <option value="Project Manager" className="bg-[#0f0c1b] text-white">Project Manager</option>
                    <option value="Team Lead" className="bg-[#0f0c1b] text-white">Team Lead</option>
                    <option value="Admin" className="bg-[#0f0c1b] text-white">Admin</option>
                    <option value="Student" className="bg-[#0f0c1b] text-white">Student</option>
                    <option value="Freelancer" className="bg-[#0f0c1b] text-white">Freelancer</option>
                    <option value="Viewer" className="bg-[#0f0c1b] text-white">Viewer</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ORGANIZATION / COLLEGE</label>
                <input
                  type="text"
                  placeholder="e.g. MIT University, Google Inc."
                  className="glass-input text-sm bg-slate-900/30 text-white"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SKILLS (COMMA-SEPARATED)</label>
                <input
                  type="text"
                  placeholder="React, Node.js, Agile, Product Planning"
                  className="glass-input text-sm bg-slate-900/30 text-white"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">EXPERIENCE RANGE</label>
                <select
                  className="glass-input text-sm bg-slate-900/30 text-white cursor-pointer select-none"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                >
                  <option value="Student / Entry" className="bg-[#0f0c1b] text-white">Entry-Level (0-2 yrs)</option>
                  <option value="Mid-Level" className="bg-[#0f0c1b] text-white">Mid-Level (2-5 yrs)</option>
                  <option value="Senior Developer" className="bg-[#0f0c1b] text-white">Senior (5-8 yrs)</option>
                  <option value="Lead/Director" className="bg-[#0f0c1b] text-white">Lead / Director (8+ yrs)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Bio / Avatar */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PROFILE PICTURE URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  className="glass-input text-sm bg-slate-900/30 text-white"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">BIO DESCRIPTION</label>
                <textarea
                  placeholder="Briefly tell us about yourself..."
                  className="glass-input text-sm h-28 resize-none bg-slate-900/30 text-white"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-4 mt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 border border-slate-700 bg-transparent text-slate-300 font-bold rounded-xl text-sm flex items-center gap-2 hover:bg-slate-900/20 transition-all hover:scale-102"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
            )}

            <button
              disabled={submitting}
              type="submit"
              className="flex-1 py-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-102 disabled:opacity-50"
            >
              {step === 3 
                ? (submitting ? 'Registering Workspace...' : 'Complete & Setup') 
                : 'Next Details'
              } 
              {step < 3 && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </form>

        <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/5 dark:border-slate-800/80 text-center text-xs">
          <span className="text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 font-bold hover:underline">
              Sign In here
            </Link>
          </span>
        </div>

      </div>
    </div>
  );
};
