import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

// Password validation helper
const validatePassword = (password) => {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
    };
    const isValid = Object.values(requirements).every(Boolean);
    return { requirements, isValid };
};

const RegisterPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const passwordValidation = validatePassword(formData.password);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (!passwordValidation.isValid) {
            setError('Password does not meet security requirements');
            return;
        }

        setLoading(true);

        try {
            await authAPI.register({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            // Redirect to login on success
            navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
            <div
                className="max-w-md w-full p-8 rounded-2xl border backdrop-blur-md"
                style={{
                    borderColor: theme.borderColor,
                    backgroundColor: 'rgba(30, 30, 30, 0.6)'
                }}
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-white/60">Join the community</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 transition-colors text-white"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 transition-colors text-white"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 transition-colors text-white"
                            placeholder="Create a strong password"
                        />
                        {/* Password Requirements */}
                        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
                            <p className="text-xs text-white/60 mb-2 font-medium">Password must contain:</p>
                            <ul className="text-xs space-y-1">
                                <li className={`flex items-center gap-2 ${passwordValidation.requirements.minLength ? 'text-green-400' : 'text-white/40'}`}>
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {passwordValidation.requirements.minLength ? 'check_circle' : 'circle'}
                                    </span>
                                    At least 8 characters
                                </li>
                                <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasUppercase ? 'text-green-400' : 'text-white/40'}`}>
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {passwordValidation.requirements.hasUppercase ? 'check_circle' : 'circle'}
                                    </span>
                                    At least 1 uppercase letter (A-Z)
                                </li>
                                <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasLowercase ? 'text-green-400' : 'text-white/40'}`}>
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {passwordValidation.requirements.hasLowercase ? 'check_circle' : 'circle'}
                                    </span>
                                    At least 1 lowercase letter (a-z)
                                </li>
                                <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasNumber ? 'text-green-400' : 'text-white/40'}`}>
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {passwordValidation.requirements.hasNumber ? 'check_circle' : 'circle'}
                                    </span>
                                    At least 1 number (0-9)
                                </li>
                                <li className={`flex items-center gap-2 ${passwordValidation.requirements.hasSpecial ? 'text-green-400' : 'text-white/40'}`}>
                                    <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {passwordValidation.requirements.hasSpecial ? 'check_circle' : 'circle'}
                                    </span>
                                    At least 1 special character (!@#$%^&*...)
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-white/80">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-white/30 transition-colors text-white"
                            placeholder="Confirm your password"
                        />
                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">error</span>
                                Passwords do not match
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
                        className="w-full py-3.5 rounded-xl font-medium transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: theme.accentColor }}
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-white/60">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="font-medium hover:underline transition-colors"
                        style={{ color: theme.accentColor }}
                    >
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
