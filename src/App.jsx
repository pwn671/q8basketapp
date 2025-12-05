import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SplashLogo from './pages/SplashLogo/SplashLogo';
import SplashWelcome from './pages/SplashWelcome/SplashWelcome';
import SignIn from './pages/SignIn/SignIn';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword/UpdatePassword';
import Verified from './pages/Verified/Verified';
import SignUp from './pages/SignUp/SignUp';
import OTPVerification from './pages/OTPVerification/OTPVerification';
import OTPVerificationReg from './pages/OTPVerificatioReg/OTPVerificationReg';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Category from './pages/Category/Category';
import Home from './pages/Home/Home';
import ProductPage from './pages/Product/Product';
import SearchPage from './pages/Search/SearchPage';
import Profile from './pages/Profile/Profile';
import { Provider } from 'react-redux';
import store from './store/store';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import ProtectedRoute from './components/ProtectedRoute';
import CartPage from './pages/cart/CartPage';
import CouponPage from './pages/Coupon/CouponPage';
import PaymentPage from './pages/Payment/PaymentPage';
import MyAddressPage from './pages/MyAddress/MyAddressPage';
import AboutUs from './pages/AboutUs/AboutUsPage';
import YourOrderPage from './pages/YourOrder/YourOrderPage';
import OrderDetailPage from './pages/OrderDetail/OrderDetailPage';
import EditProfilePage from './pages/EditProfile/EditProfile';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./styles/AndroidSafeArea.css";
import AddCardPage from './pages/AddCard/AddCardPage';
import { configureStatusBar } from './utils/statusBar';
import { detectSafeAreas } from './utils/safeAreaDetector';
import AccountPrivacyPage from './pages/AccountPrivacy/AccountPrivacyPage';
import SaveAddress from './pages/AddressPicker/SaveAddress';
import AddressPickerPage from './pages/AddressPicker/AddressPickerPage';
import SearchLocationPage from './pages/SearchLocation/SearchLocationPage';


export default function App() {
  // Configure StatusBar for proper safe area handling
  useEffect(() => {
    configureStatusBar();
    detectSafeAreas();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Always Accessible */}
        <Route path="/" element={<SplashLogoWithRedirect />} />
        <Route path="/welcome" element={<SplashWelcomeWithContinue />} />

        {/* Public Only Routes */}
        <Route
          path="/signin"
          element={
            <PublicOnlyRoute>
              <SignInWithHandlers />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignUpWithHandler />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordFlowWithHandler />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/otp"
          element={
            <PublicOnlyRoute>
              <OTPVerificationWithHandler />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/otp-reg"
          element={
            <PublicOnlyRoute>
              <OTPVerificationRegWithHandler />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/update-password"
          element={
            <PublicOnlyRoute>
              <UpdatePasswordWithUpdated />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verified"
          element={
            <PublicOnlyRoute>
              <VerifiedWithHandler />
            </PublicOnlyRoute>
          }
        />


        {/* Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeWithHandler />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Provider store={store}>
                <Profile />
              </Provider>
            </ProtectedRoute>
          }
        />
        <Route path='/products/:id' element={
          <ProtectedRoute>
            <ProductDetail />
          </ProtectedRoute>
        } />
        <Route path='/category' element={
          <ProtectedRoute>
            <Category />
          </ProtectedRoute>
        } />
        <Route path='/cart' element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } />
        <Route path='/coupon' element={
          <ProtectedRoute>
            <CouponPage />
          </ProtectedRoute>
        } />
        <Route path='/checkout' element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />
        <Route path='/add-card' element={
          <ProtectedRoute>
            <AddCardPage />
          </ProtectedRoute>
        } />
        <Route path='/my-address' element={
          <ProtectedRoute>
            <MyAddressPage />
          </ProtectedRoute>
        } />
        <Route path='/aboutus' element={
          <ProtectedRoute>
            <AboutUs />
          </ProtectedRoute>
        } />
        <Route path='/account-privacy' element={
          <ProtectedRoute>
            <AccountPrivacyPage />
          </ProtectedRoute>
        } />
        <Route path='/address-picker' element={
          <SaveAddress />
        } />
        <Route path='/search-location' element={
          <ProtectedRoute>
            <SearchLocationPage />

          </ProtectedRoute>
        } />
        <Route path='/orders' element={ 
          <ProtectedRoute>
            <YourOrderPage />
          </ProtectedRoute>
        } />
        <Route path='/user/order/:orderId/details' element={ 
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        } />
        <Route path='/edit-profile' element={ 
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={
          <SignIn />
        } />
      </Routes>

    </Router>
  );
}


// Splash screen redirects to welcome after timeout
function SplashLogoWithRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    const timeout = setTimeout(() => navigate('/welcome'), 1500);
    return () => clearTimeout(timeout);
  }, [navigate]);
  return <SplashLogo />;
}

// Welcome screen to SignIn
function SplashWelcomeWithContinue() {
  const navigate = useNavigate();
  return <SplashWelcome onContinue={() => navigate('/signin')} />;
}

// SignIn screen to Forgot or SignUp
function SignInWithHandlers() {
  const navigate = useNavigate();
  return (
    <SignIn
      onForgotPassword={() => navigate('/forgot-password')}
      onSignUp={() => navigate('/signup')}
    />
  );
}

function ForgotPasswordFlowWithHandler() {
  const navigate = useNavigate();
  return <ForgotPassword onOtpSent={() => navigate('/otp')} />;
}

// OTP screen handler
function OTPVerificationWithHandler() {
  const navigate = useNavigate();
  return <OTPVerification onVerify={() => navigate('/update-password')} />;
}

// Update password to go back to signin
function UpdatePasswordWithUpdated() {
  const navigate = useNavigate();
  return <UpdatePassword onNext={() => navigate('/signin')} />;
}

// Signup to SignIn after registration
function SignUpWithHandler() {
  const navigate = useNavigate();
  return (
    <SignUp
      onSignIn={() => navigate('/signin')}
      onRegistrationSuccess={() => navigate('/otp-reg')}
    />
  );
}

// After password update success
function VerifiedWithHandler() {
  return <Verified onVerified={() => { }} />;
}

// Home screen (you can add more handlers here)
function HomeWithHandler() {
  return <Home />;
}
// OTP Verification for Registration with token storage
function OTPVerificationRegWithHandler() {
  const navigate = useNavigate();
  return <OTPVerificationReg onVerify={() => navigate('/verified')} />;
}
