import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: ''
    });
    const [step, setStep] = useState('details'); // 'details' or 'otp'
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (step === 'details') {
                if (formData.password !== formData.confirmPassword) {
                    toast.error("Passwords do not match");
                    setLoading(false);
                    return;
                }

                // Initiate Registration
                await api.post('/auth/register-init', { email: formData.email });
                toast.success("OTP sent to your email!");
                setStep('otp');
            } else {
                // Verify OTP & Register
                const res = await api.post('/auth/register-verify', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    otp: formData.otp
                });

                login(res.data.user, res.data.token);
                toast.success("Registration successful!");
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
                <p className="text-muted-foreground">
                    {step === 'details' ? "Enter your details below to create your account" : "Enter the verification code sent to your email"}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {step === 'details' ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>
                    </>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code (OTP)</Label>
                        <Input
                            id="otp"
                            name="otp"
                            placeholder="123456"
                            required
                            value={formData.otp}
                            onChange={handleChange}
                            className="text-center text-lg tracking-widest"
                            maxLength={6}
                        />
                        <p className="text-xs text-muted-foreground text-center">
                            Code sent to {formData.email}
                        </p>
                    </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {step === 'details' ? 'Sending OTP...' : 'Verifying...'}
                        </>
                    ) : (
                        step === 'details' ? 'Next' : 'Create Account'
                    )}
                </Button>
            </form>

            {step === 'otp' && (
                <div className="text-center">
                    <Button variant="link" size="sm" onClick={() => setStep('details')} className="text-muted-foreground">
                        Back to details
                    </Button>
                </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="font-medium text-primary hover:underline">
                    Sign in
                </Link>
            </div>
        </div>
    );
}
