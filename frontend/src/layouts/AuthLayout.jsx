import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="flex min-h-screen">
            {/* Left Side - Form */}
            <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-background">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <Outlet />
                </div>
            </div>

            {/* Right Side - Image/Hero */}
            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-indigo-600 to-violet-600 object-cover flex items-center justify-center">
                    <div className="text-white text-center p-12">
                        <h1 className="text-4xl font-bold mb-4">Modern Space Booking</h1>
                        <p className="text-lg opacity-90">Experience the future of reservation management.</p>
                    </div>
                    {/* You can add an <img> here instead */}
                </div>
            </div>
        </div>
    );
}
