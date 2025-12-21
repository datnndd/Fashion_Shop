import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(formData.email, formData.password);
            // Store token via context
            login(response.access_token, response.user);
            // Navigate based on role
            if (response.user && response.user.role === 'manager') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
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
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-white/60">Sign in to continue to your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            placeholder="Enter your password"
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer text-white/60 hover:text-white transition-colors">
                            <input type="checkbox" className="rounded bg-white/10 border-white/20" />
                            <span>Remember me</span>
                        </label>
                        <a href="#" className="hover:underline" style={{ color: theme.accentColor }}>
                            Forgot password?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl font-medium transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: theme.accentColor }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-white/60">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-medium hover:underline transition-colors"
                        style={{ color: theme.accentColor }}
                    >
                        Create account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
