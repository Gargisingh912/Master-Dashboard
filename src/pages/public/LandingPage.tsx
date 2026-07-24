import React from "react";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    QrCode,
    Smartphone,
    TrendingUp,
    Clock,
    Check,
    Store,
    Menu as MenuIcon,
    X,
} from "lucide-react";
import { Button } from "../../components/ui";
import { APP_CONFIG } from "../../config/config";

const LandingPage: React.FC = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50 ">
            {/* Navigation */}
            <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="flex items-center space-x-2">
                            <Store className="w-8 h-8 text-black hover:text-gray-800" />
                            <span className="text-xl font-bold text-gray-800 ">
                                {APP_CONFIG.appName}
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href="#features"
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#pricing"
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Pricing
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                How it Works
                            </a>
                            <Link
                                to="/login"
                                className="text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Login
                            </Link>
                            <Link to="/register">
                                <Button size="sm" className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group">Get Started</Button>
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-gray-800 "
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <MenuIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 space-y-3 border-t border-gray-200 ">
                            <a
                                href="#features"
                                className="block py-2 text-gray-500 hover:text-gray-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a
                                href="#pricing"
                                className="block py-2 text-gray-500 hover:text-gray-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Pricing
                            </a>
                            <a
                                href="#how-it-works"
                                className="block py-2 text-gray-500 hover:text-gray-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                How it Works
                            </a>
                            <Link
                                to="/login"
                                className="block py-2 text-gray-500 hover:text-gray-800 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                <Button fullWidth className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 md:py-32 overflow-hidden">
                <div className="container-custom">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                            Digitize Your Restaurant
                            <br />
                            in Minutes
                        </h1>
                        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
                            Get your own QR ordering system. Let customers order directly from
                            their phones. No app downloads, no commission fees, just seamless
                            ordering.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register">
                                <Button
                                    size="lg"
                                    icon={<ArrowRight className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group" />}
                                    className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group"
                                >
                                    Start Free Trial
                                </Button>
                            </Link>


                            <a href="#how-it-works">
                                <Button size="lg" className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group">
                                    See How it Works
                                </Button>
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
                            <div>
                                <div className="text-3xl font-bold text-gray-800 mb-1">50+</div>
                                <div className="text-sm text-gray-500 ">
                                    Active Restaurants
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-800 mb-1">10k+</div>
                                <div className="text-sm text-gray-500 ">
                                    Orders Processed
                                </div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-800 mb-1">4.9</div>
                                <div className="text-sm text-gray-500 ">
                                    Customer Rating
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white ">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Everything you need to go digital
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            A complete ordering system designed specifically for restaurants,
                            cafes, and food trucks
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: QrCode,
                                title: "QR Code Ordering",
                                description:
                                    "Customers scan your unique QR code to view menu and place orders instantly",
                            },
                            {
                                icon: Smartphone,
                                title: "Mobile-First Design",
                                description:
                                    "Beautiful, fast interface that works perfectly on all devices",
                            },
                            {
                                icon: TrendingUp,
                                title: "Real-Time Updates",
                                description:
                                    "Get instant notifications for new orders. Update menu availability live",
                            },
                            {
                                icon: Clock,
                                title: "Save Time",
                                description:
                                    "No more taking orders manually. Focus on cooking and serving",
                            },
                        ].map((feature, index) => (
                            <div key={index} className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                    <feature.icon className="w-8 h-8 text-black hover:text-gray-800" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 ">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Simple, transparent pricing
                        </h2>
                        <p className="text-lg text-gray-500 ">
                            Start with a 7-day free trial — full Premium features included. No credit card required.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {Object.entries(APP_CONFIG.plans).map(([key, plan]) => (
                            <div
                                key={key}
                                className={`rounded-xl border border-gray-200 bg-white p-6 ${key === "premium" ? "ring-2 ring-black relative" : ""
                                    }`}
                            >
                                {key === "premium" && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 rounded-full text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        {plan.name}
                                    </h3>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-800 ">
                                            {APP_CONFIG.defaultCurrency}
                                            {plan.price}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-gray-500 ">
                                                /{plan.duration}
                                            </span>
                                        )}
                                    </div>
                                    {plan.price === 0 && (
                                        <span className="text-sm text-gray-500 ">
                                            {plan.duration}
                                        </span>
                                    )}
                                </div>
                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start">
                                            <Check className="w-5 h-5 text-black mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-500 ">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/register">
                                    <Button
                                        fullWidth
                                        className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group">
                                        {plan.price === 0 ? "Start Free Trial" : "Get Started"}
                                    </Button>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-20 bg-white ">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                            Get started in 3 simple steps
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: "01",
                                title: "Register Your Restaurant",
                                description:
                                    "Fill out a quick form with your restaurant details. Our team will verify and contact you within 24 hours.",
                            },
                            {
                                step: "02",
                                title: "Setup Your Menu",
                                description:
                                    "Add your dishes, prices, photos, and categories through our easy-to-use dashboard.",
                            },
                            {
                                step: "03",
                                title: "Start Taking Orders",
                                description:
                                    "Display your QR code at tables. Customers scan, order, and you get notified instantly!",
                            },
                        ].map((item, index) => (
                            <div key={index} className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-black text-white text-2xl font-bold mb-4">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 ">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="container-custom">
                    <div className="bg-black rounded-lg p-12 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Ready to digitize your restaurant?
                        </h2>
                        <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                            Join 50+ restaurants already using {APP_CONFIG.appName} to
                            streamline their operations
                        </p>
                        <Link to="/register">
                            <Button
                                size="lg"

                                className="bg-transparent border border-black text-black hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-colors duration-200 group"
                            >
                                Get Started for Free
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200 py-12">
                <div className="container-custom">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Store className="w-6 h-6 text-black hover:text-gray-800" />
                                <span className="text-lg font-bold text-gray-800 ">
                                    {APP_CONFIG.appName}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 ">
                                Digital ordering made simple for restaurants
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#features"
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#pricing"
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                    >
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#how-it-works"
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                    >
                                        How it Works
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Company</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="https://gargiai.gargisinghwork22.workers.dev/" 
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                     target="_blank">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                    >
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                    >
                                        Support
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-4">Legal</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                    >
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-sm text-gray-500 hover:text-gray-800 "
                                    >
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500 ">
                        © {new Date().getFullYear()} {APP_CONFIG.appName}. All rights
                        reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;