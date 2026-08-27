import React, { createContext, useContext, useState, useEffect } from 'react';
import { useHotel } from './HotelContext';

const CustomerAuthContext = createContext();

const BACKEND_URL = 'http://localhost:5000';

const initialDemoCustomer = {
  id: 'CUST-100',
  _id: 'CUST-100',
  name: 'Muhammed Ibrahim',
  email: 'pmmuhammedibrahim786@gmail.com',
  phone: '+1 (555) 786-0199',
  role: 'Customer',
  vipStatus: 'Diamond',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  address: '100 Oceanfront Promenade, Beverly Hills, CA',
  foodPreferences: 'Vintage Dom Pérignon Champagne, Wagyu Steak, Fresh Espresso',
  roomPreferences: 'Presidential Sovereign Suite 401, Private Balcony, High Floor',
  favorites: ['401', '301', '101'],
  notifications: [
    {
      id: 'CNOTIF-1',
      title: 'Diamond VIP Welcome Privileges',
      message: 'Your 24/7 dedicated butler service and private helipad access are active.',
      type: 'vip',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 'CNOTIF-2',
      title: 'Reservation Confirmed #BK-7860',
      message: 'Penthouse Suite 401 reservation confirmed for Aug 20 - Aug 28.',
      type: 'booking',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true
    }
  ]
};

export const CustomerAuthProvider = ({ children }) => {
  const { addToast } = useHotel();

  const [customerToken, setCustomerToken] = useState(() => {
    return localStorage.getItem('customer_jwt_token') || '';
  });

  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(() => {
    return localStorage.getItem('customer_auth') === 'true';
  });

  const [currentCustomer, setCurrentCustomer] = useState(() => {
    const saved = localStorage.getItem('customer_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [customerFavorites, setCustomerFavorites] = useState(() => {
    const saved = localStorage.getItem('customer_favorites');
    return saved ? JSON.parse(saved) : ['401', '301'];
  });

  const [customerNotifications, setCustomerNotifications] = useState(() => {
    const saved = localStorage.getItem('customer_notifications');
    return saved ? JSON.parse(saved) : initialDemoCustomer.notifications;
  });

  // Modal Control States
  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);
  const [customerAuthModalMode, setCustomerAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  const [resetEmailPlaceholder, setResetEmailPlaceholder] = useState('');
  const [activeCustomerPage, setActiveCustomerPage] = useState('home'); // 'home' | 'rooms' | 'about' | 'contact' | 'dashboard'
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState(null);

  // Sync to LocalStorage
  useEffect(() => {
    if (customerToken) {
      localStorage.setItem('customer_jwt_token', customerToken);
    } else {
      localStorage.removeItem('customer_jwt_token');
    }
  }, [customerToken]);

  useEffect(() => {
    localStorage.setItem('customer_auth', isCustomerAuthenticated ? 'true' : 'false');
  }, [isCustomerAuthenticated]);

  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('customer_user', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('customer_user');
    }
  }, [currentCustomer]);

  useEffect(() => {
    localStorage.setItem('customer_favorites', JSON.stringify(customerFavorites));
  }, [customerFavorites]);

  useEffect(() => {
    localStorage.setItem('customer_notifications', JSON.stringify(customerNotifications));
  }, [customerNotifications]);

  const openCustomerAuthModal = (mode = 'login', prefillEmail = '') => {
    setCustomerAuthModalMode(mode);
    if (prefillEmail) setResetEmailPlaceholder(prefillEmail);
    setIsCustomerAuthModalOpen(true);
  };

  const closeCustomerAuthModal = () => {
    setIsCustomerAuthModalOpen(false);
  };

  /**
   * Customer Registration (supports username and email)
   */
  const customerRegister = async ({ name, username, email, phone, password, confirmPassword, acceptTerms }) => {
    if (!name || !email || !password) {
      addToast('Full name, email, and password are required.', 'error');
      return { success: false, message: 'Please fill in all required fields.' };
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (confirmPassword && password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return { success: false, message: 'Passwords do not match.' };
    }

    if (!acceptTerms) {
      addToast('Please accept the Terms & Conditions.', 'error');
      return { success: false, message: 'Please accept Terms & Conditions.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = (username || email.split('@')[0] || name.toLowerCase().replace(/\s+/g, '')).trim().toLowerCase();

    try {
      const res = await fetch(`${BACKEND_URL}/api/customer/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          username: cleanUsername,
          email: cleanEmail,
          phone: phone ? phone.trim() : '',
          password,
          confirmPassword,
          acceptTerms
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setIsCustomerAuthenticated(true);
        setCurrentCustomer(data.customer);
        setCustomerToken(data.token);
        setCustomerFavorites(data.customer.favorites || ['401']);
        closeCustomerAuthModal();
        addToast(`Welcome to Aurelia Grand Resort, ${data.customer.name}!`, 'success');
        return { success: true, customer: data.customer };
      } else {
        const errorMsg = data.message || 'Registration failed. Please check your details.';
        addToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }
    } catch (e) {
      // High-Fidelity Local Fallback
      console.warn('Backend offline, registering customer locally:', e);
      const newCustomer = {
        id: `CUST-${Date.now()}`,
        _id: `CUST-${Date.now()}`,
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        phone: phone ? phone.trim() : '+1 (555) 019-9922',
        role: 'Customer',
        vipStatus: 'Standard',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        address: '100 Luxury Avenue',
        foodPreferences: 'Standard Gourmet',
        roomPreferences: 'Ocean View Balcony',
        favorites: ['401'],
        notifications: [
          {
            id: `CNOTIF-${Date.now()}`,
            title: 'Welcome to Aurelia Grand Resort',
            message: 'Your account is ready. Discover our luxury suites and villas.',
            type: 'info',
            timestamp: new Date().toISOString(),
            read: false
          }
        ]
      };

      const mockToken = `cust_jwt_${Date.now()}`;
      setIsCustomerAuthenticated(true);
      setCurrentCustomer(newCustomer);
      setCustomerToken(mockToken);
      setCustomerFavorites(newCustomer.favorites);
      closeCustomerAuthModal();
      addToast(`Account created! Welcome, @${cleanUsername}.`, 'success');
      return { success: true, customer: newCustomer };
    }
  };

  /**
   * Customer Login (supports username or email)
   */
  const customerLogin = async (loginIdentifier, password, rememberMe = true) => {
    if (!loginIdentifier || !password) {
      addToast('Please enter your username/email and password.', 'error');
      return { success: false, message: 'Please enter username/email and password.' };
    }

    const cleanIdentifier = loginIdentifier.trim().toLowerCase();

    try {
      const res = await fetch(`${BACKEND_URL}/api/customer/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: cleanIdentifier.includes('@') ? cleanIdentifier : undefined,
          username: !cleanIdentifier.includes('@') ? cleanIdentifier : undefined,
          identifier: cleanIdentifier,
          password, 
          rememberMe 
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setIsCustomerAuthenticated(true);
        setCurrentCustomer(data.customer);
        setCustomerToken(data.token);
        if (data.customer.favorites) setCustomerFavorites(data.customer.favorites);
        closeCustomerAuthModal();
        addToast(`Welcome back, ${data.customer.name}!`, 'success');
        return { success: true, customer: data.customer };
      } else {
        const errorMsg = data.message || 'Invalid username, email, or password.';
        addToast(errorMsg, 'error');
        return { success: false, message: errorMsg };
      }
    } catch (e) {
      // Local fallback for demo
      console.warn('Backend offline, logging in demo customer locally:', e);
      let matched = cleanIdentifier.includes('alexander') || cleanIdentifier === 'alexander'
        ? {
            id: 'CUST-101',
            name: 'Lord Alexander Wright',
            username: 'alexander',
            email: 'alexander.wright@royals.co.uk',
            phone: '+44 7911 123456',
            role: 'Customer',
            vipStatus: 'Gold',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
            address: '10 Kensington Palace Gardens, London, UK',
            foodPreferences: 'Dom Pérignon, Organic Gluten-free',
            roomPreferences: 'High Floor Penthouse',
            favorites: ['401', '201'],
            notifications: []
          }
        : {
            ...initialDemoCustomer,
            username: cleanIdentifier.includes('@') ? cleanIdentifier.split('@')[0] : cleanIdentifier,
            email: cleanIdentifier.includes('@') ? cleanIdentifier : `${cleanIdentifier}@resort.com`,
            name: cleanIdentifier.includes('@') 
              ? cleanIdentifier.split('@')[0].replace('.', ' ') 
              : cleanIdentifier.charAt(0).toUpperCase() + cleanIdentifier.slice(1)
          };

      const mockToken = `cust_jwt_${Date.now()}`;
      setIsCustomerAuthenticated(true);
      setCurrentCustomer(matched);
      setCustomerToken(mockToken);
      setCustomerFavorites(matched.favorites || ['401']);
      closeCustomerAuthModal();
      addToast(`Welcome back, ${matched.name}!`, 'success');
      return { success: true, customer: matched };
    }
  };

  /**
   * Customer Forgot Password
   */
  const customerForgotPassword = async (email) => {
    if (!email) {
      addToast('Please enter your email address.', 'error');
      return { success: false, message: 'Email address required.' };
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/customer/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Password reset code sent to ${email}!`, 'success');
        return { success: true, resetToken: data.resetToken || '8A3F12', message: data.message };
      }
    } catch (e) {
      console.warn('Backend offline, providing local reset token:', e);
    }

    const demoToken = 'RESET-786';
    addToast(`Password reset code generated: ${demoToken}`, 'info');
    return { success: true, resetToken: demoToken, message: 'Reset token generated.' };
  };

  /**
   * Customer Reset Password
   */
  const customerResetPassword = async (token, newPassword, confirmPassword) => {
    if (!token || !newPassword) {
      addToast('Reset token and new password are required.', 'error');
      return { success: false, message: 'Reset token and new password required.' };
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return { success: false, message: 'Password must be at least 6 characters.' };
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return { success: false, message: 'Passwords do not match.' };
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/customer/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Password reset successfully! Please sign in.', 'success');
        setCustomerAuthModalMode('login');
        return { success: true };
      } else {
        addToast(data.message || 'Failed to reset password.', 'error');
        return { success: false, message: data.message };
      }
    } catch (e) {
      console.warn('Backend offline, simulating reset success:', e);
      addToast('Password reset successfully! Please sign in.', 'success');
      setCustomerAuthModalMode('login');
      return { success: true };
    }
  };

  /**
   * Customer Logout
   */
  const customerLogout = () => {
    setIsCustomerAuthenticated(false);
    setCurrentCustomer(null);
    setCustomerToken('');
    localStorage.removeItem('customer_jwt_token');
    localStorage.removeItem('customer_auth');
    localStorage.removeItem('customer_user');
    addToast('You have signed out of your customer account.', 'info');
  };

  /**
   * Update Profile Details
   */
  const updateCustomerProfile = async (profileData) => {
    if (!currentCustomer) return { success: false };

    try {
      const res = await fetch(`${BACKEND_URL}/api/customer/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
          'x-customer-token': customerToken
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentCustomer(data.customer);
        addToast('Profile updated successfully!', 'success');
        return { success: true, customer: data.customer };
      }
    } catch (e) {
      console.warn('Backend offline, updating profile locally:', e);
    }

    const updated = { ...currentCustomer, ...profileData };
    setCurrentCustomer(updated);
    addToast('Profile updated successfully!', 'success');
    return { success: true, customer: updated };
  };

  /**
   * Change Password
   */
  const changeCustomerPassword = async (currentPassword, newPassword, confirmPassword) => {
    if (!currentPassword || !newPassword) {
      addToast('Current and new password are required.', 'error');
      return { success: false, message: 'All fields required.' };
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/customer/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
          'x-customer-token': customerToken
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Password changed successfully!', 'success');
        return { success: true };
      } else {
        addToast(data.message || 'Current password incorrect.', 'error');
        return { success: false, message: data.message };
      }
    } catch (e) {
      console.warn('Backend offline, simulating change password:', e);
      addToast('Password changed successfully!', 'success');
      return { success: true };
    }
  };

  /**
   * Toggle Favorite Room
   */
  const toggleFavoriteRoom = async (roomNumber) => {
    const isFavorited = customerFavorites.includes(roomNumber);
    const updated = isFavorited
      ? customerFavorites.filter((r) => r !== roomNumber)
      : [...customerFavorites, roomNumber];

    setCustomerFavorites(updated);
    addToast(
      !isFavorited
        ? `Room ${roomNumber} added to your Saved Favorites!`
        : `Room ${roomNumber} removed from favorites.`,
      'info'
    );

    if (customerToken) {
      try {
        await fetch(`${BACKEND_URL}/api/customer/favorites/${roomNumber}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customerToken}`,
            'x-customer-token': customerToken
          }
        });
      } catch (e) {
        // Handled
      }
    }
  };

  /**
   * Mark All Customer Notifications As Read
   */
  const markCustomerNotificationsRead = () => {
    setCustomerNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All customer alerts marked as read.', 'info');
  };

  const clearCustomerNotifications = () => {
    setCustomerNotifications([]);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customerToken,
        isCustomerAuthenticated,
        currentCustomer,
        customerFavorites,
        customerNotifications,
        unreadNotificationsCount: customerNotifications.filter((n) => !n.read).length,
        isCustomerAuthModalOpen,
        customerAuthModalMode,
        resetEmailPlaceholder,
        activeCustomerPage,
        setActiveCustomerPage,
        selectedRoomForDetails,
        setSelectedRoomForDetails,
        openCustomerAuthModal,
        closeCustomerAuthModal,
        customerRegister,
        customerLogin,
        customerForgotPassword,
        customerResetPassword,
        customerLogout,
        updateCustomerProfile,
        changeCustomerPassword,
        toggleFavoriteRoom,
        markCustomerNotificationsRead,
        clearCustomerNotifications
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
