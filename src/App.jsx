import { useState, useEffect } from 'react';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import PricingIntroSection from './components/PricingIntroSection';
import CtaBannerSection from './components/CtaBannerSection';
import CampusInstallationBanner from './components/CampusInstallationBanner';
import ContactPage from './components/ContactPage';
import FooterSection from './components/FooterSection';
import PricingPage from './components/PricingPage';
import FeaturesPage from './components/FeaturesPage';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOtp from './pages/auth/VerifyOtp';
import ResetPassword from './pages/auth/ResetPassword';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import './App.css';

function App() {
  const getPricingAudienceFromLocation = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (
      path === '/pricing/universities' ||
      hash === '#pricing/universities' ||
      hash === '#campus-pricing' ||
      hash === '#/pricing/universities'
    ) {
      return 'universities';
    }
    if (
      path === '/pricing/students' ||
      path === '/pricing' ||
      hash === '#pricing/students' ||
      hash === '#pricing' ||
      hash === '#/pricing/students' ||
      hash === '#/pricing'
    ) {
      return 'students';
    }
    return null;
  };

  const isContactPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return path === '/contact' || hash === '#contact-page' || hash === '#/contact' || hash === '#contact';
  };

  const isFeaturesPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/features' ||
      hash === '#features-page' ||
      hash === '#/features' ||
      hash === '#features'
    );
  };

  const isLoginPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/login' ||
      hash === '#login' ||
      hash === '#/login' ||
      hash === '#login-page'
    );
  };

  const isForgotPasswordPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/forgot-password' ||
      hash === '#forgot-password' ||
      hash === '#/forgot-password'
    );
  };

  const isOtpPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/verify-otp' ||
      hash === '#verify-otp' ||
      hash === '#/verify-otp'
    );
  };

  const isResetPasswordPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/reset-password' ||
      hash === '#reset-password' ||
      hash === '#/reset-password'
    );
  };

  const isSignUpPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/signup' ||
      hash === '#signup' ||
      hash === '#/signup' ||
      hash === '#signup-page'
    );
  };

  const isDashboardPage = () => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    return (
      path === '/dashboard' ||
      hash === '#dashboard' ||
      hash === '#/dashboard' ||
      hash === '#student-dashboard'
    );
  };

  const initialAudience = getPricingAudienceFromLocation();
  const [authState, setAuthState] = useState(() => {
    return window.history?.state?.usr || {};
  });

  const [currentView, setCurrentView] = useState(() => {
    if (isDashboardPage()) return 'dashboard';
    if (isLoginPage()) return 'login';
    if (isForgotPasswordPage()) return 'forgot-password';
    if (isOtpPage()) return 'verify-otp';
    if (isResetPasswordPage()) return 'reset-password';
    if (isSignUpPage()) return 'signup';
    if (isFeaturesPage()) return 'features';
    if (isContactPage()) return 'contact';
    return initialAudience ? 'pricing' : 'home';
  });
  const [pricingAudience, setPricingAudience] = useState(() => {
    return initialAudience || 'students';
  });

  useEffect(() => {
    const handleNavigation = () => {
      const audience = getPricingAudienceFromLocation();
      if (isDashboardPage()) {
        setCurrentView('dashboard');
      } else if (isLoginPage()) {
        setCurrentView('login');
      } else if (isForgotPasswordPage()) {
        setCurrentView('forgot-password');
      } else if (isOtpPage()) {
        setCurrentView('verify-otp');
      } else if (isResetPasswordPage()) {
        setCurrentView('reset-password');
      } else if (isSignUpPage()) {
        setCurrentView('signup');
      } else if (isFeaturesPage()) {
        setCurrentView('features');
      } else if (audience) {
        setPricingAudience(audience);
        setCurrentView('pricing');
      } else if (isContactPage()) {
        setCurrentView('contact');
      } else if (
        (window.location.pathname === '/' || window.location.pathname === '') &&
        (window.location.hash === '' || window.location.hash === '#home' || window.location.hash === '#faq')
      ) {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  const navigateToPricing = (audience = 'students') => {
    setPricingAudience(audience);
    if (currentView !== 'home') {
      setCurrentView('home');
    }
    setTimeout(() => {
      const el = document.getElementById('pricing');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const navigateToContact = () => {
    setCurrentView('contact');
    window.location.hash = '#contact';
    try {
      window.history.pushState({}, '', '/contact');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToFeatures = () => {
    setCurrentView('features');
    window.location.hash = '#features';
    try {
      window.history.pushState({}, '', '/features');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = (targetSection) => {
    if (targetSection === 'contact') {
      navigateToContact();
      return;
    }
    if (targetSection === 'features') {
      navigateToFeatures();
      return;
    }
    window.location.hash = targetSection ? `#${targetSection}` : '';
    try {
      window.history.pushState({}, '', '/');
    } catch {
      // Fallback
    }
    setCurrentView('home');
    if (targetSection) {
      setTimeout(() => {
        const el = document.getElementById(targetSection);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartUpload = () => {
    navigateToSignUp();
  };

  const handleHowItWorks = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
    }
    const target = document.getElementById('how-it-works') || document.getElementById('about');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateToLogin = (state = {}) => {
    setAuthState(state);
    setCurrentView('login');
    window.location.hash = '#login';
    try {
      window.history.pushState({ usr: state }, '', '/login');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToForgotPassword = (state = {}) => {
    setAuthState(state);
    setCurrentView('forgot-password');
    window.location.hash = '#forgot-password';
    try {
      window.history.pushState({ usr: state }, '', '/forgot-password');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToVerifyOtp = (state = {}) => {
    setAuthState(state);
    setCurrentView('verify-otp');
    window.location.hash = '#verify-otp';
    try {
      window.history.pushState({ usr: state }, '', '/verify-otp');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToResetPassword = (state = {}) => {
    setAuthState(state);
    setCurrentView('reset-password');
    window.location.hash = '#reset-password';
    try {
      window.history.pushState({ usr: state }, '', '/reset-password');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSignUp = () => {
    setCurrentView('signup');
    window.location.hash = '#signup';
    try {
      window.history.pushState({}, '', '/signup');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignUp = () => {
    navigateToSignUp();
  };

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
    window.location.hash = '#dashboard';
    try {
      window.history.pushState({}, '', '/dashboard');
    } catch {
      // Fallback
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (currentView === 'login') {
    return (
      <div className="home">
        <Login
          onNavigateHome={(targetRoute) => {
            if (targetRoute === '/dashboard' || targetRoute === '#dashboard') {
              navigateToDashboard();
            } else if (targetRoute && targetRoute !== '/') {
              window.location.href = targetRoute;
            } else {
              navigateToHome();
            }
          }}
          onNavigateForgotPassword={(state) => navigateToForgotPassword(state)}
          onNavigateSignUp={() => navigateToSignUp()}
          locationState={authState}
        />
      </div>
    );
  }

  if (currentView === 'forgot-password') {
    return (
      <div className="home">
        <ForgotPassword
          onNavigateHome={() => navigateToHome()}
          onNavigateVerifyOtp={(state) => navigateToVerifyOtp(state)}
          onNavigateLogin={() => navigateToLogin()}
        />
      </div>
    );
  }

  if (currentView === 'verify-otp') {
    return (
      <div className="home">
        <VerifyOtp
          onNavigateHome={() => navigateToHome()}
          onNavigateResetPassword={(state) => navigateToResetPassword(state)}
          onNavigateForgotPassword={() => navigateToForgotPassword()}
          locationState={authState}
        />
      </div>
    );
  }

  if (currentView === 'reset-password') {
    return (
      <div className="home">
        <ResetPassword
          onNavigateHome={() => navigateToHome()}
          onNavigateLogin={(state) => navigateToLogin(state)}
          onNavigateForgotPassword={() => navigateToForgotPassword()}
          locationState={authState}
        />
      </div>
    );
  }

  if (currentView === 'signup') {
    return (
      <div className="home">
        <SignUp
          onNavigateHome={() => navigateToHome()}
          onNavigateLogin={() => navigateToLogin()}
          onNavigateDashboard={navigateToDashboard}
        />
      </div>
    );
  }

  if (currentView === 'features') {
    return (
      <div className="home">
        <FeaturesPage
          onBack={navigateToHome}
          onStartUpload={handleStartUpload}
          onPricing={navigateToPricing}
          onContact={navigateToContact}
        />
      </div>
    );
  }

  if (currentView === 'pricing') {
    return (
      <div className="home">
        <PricingPage
          initialAudience={pricingAudience}
          onBack={navigateToHome}
          onStartUpload={handleStartUpload}
          onContact={navigateToContact}
        />
      </div>
    );
  }

  if (currentView === 'contact') {
    return (
      <div className="home">
        <ContactPage
          onBack={navigateToHome}
          onNavigateCampusPlans={() => navigateToPricing('universities')}
        />
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <StudentDashboard
        onNavigateHome={() => navigateToHome()}
        onUploadDocument={navigateToSignUp}
        onLogout={() => {
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          } catch {}
          setAuthState({});
          navigateToLogin();
        }}
      />
    );
  }

  return (
    <div className="home">
      <HeroSection
        onStartUpload={handleStartUpload}
        onHowItWorks={handleHowItWorks}
        onSignUp={handleSignUp}
        onNavigatePricing={navigateToPricing}
        onNavigateCampusPricing={() => navigateToPricing('universities')}
        onNavigateContact={navigateToContact}
        onNavigateFeatures={navigateToFeatures}
        onNavigateDashboard={navigateToDashboard}
      />
      <AboutSection
        onGetStarted={handleStartUpload}
        onExploreFeatures={navigateToFeatures}
      />
      <FeaturesSection onGetStarted={handleStartUpload} />
      <PricingIntroSection
        audience={pricingAudience}
        onAudienceChange={setPricingAudience}
        onLogin={navigateToSignUp}
        onContact={navigateToContact}
      />
      <CtaBannerSection onUpload={handleStartUpload} />
      <CampusInstallationBanner onContact={navigateToContact} />
      <FooterSection onNavigateSection={navigateToHome} onNavigateContact={navigateToContact} />
    </div>
  );
}

export default App;
