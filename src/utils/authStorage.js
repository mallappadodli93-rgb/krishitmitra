// LocalStorage helper for KrishiMitra Farmer Authentication (Frontend-only)

const STORAGE_KEY_FARMERS = 'krishimitra_registered_farmers';
const STORAGE_KEY_ACTIVE_USER = 'krishimitra_active_user';

// Pre-seeded demo farmer so user can test login immediately
const DEFAULT_DEMO_FARMER = {
  farmerId: 'KM-2026-8842',
  name: 'Ramesh Patel',
  mobile: '9876543210',
  email: 'ramesh.farmer@gmail.com',
  password: 'password123',
  village: 'Niphad',
  district: 'Nashik',
  state: 'Maharashtra',
  preferredLanguage: 'Marathi',
  registeredAt: '2026-11-01T10:00:00.000Z'
};

/**
 * Get all registered farmers from LocalStorage (initializes with demo farmer if empty)
 */
export function getRegisteredFarmers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FARMERS);
    if (!raw) {
      const initial = [DEFAULT_DEMO_FARMER];
      localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading registered farmers from localStorage', err);
    return [DEFAULT_DEMO_FARMER];
  }
}

/**
 * Register a new farmer into LocalStorage
 */
export function registerFarmer(farmerData) {
  const farmers = getRegisteredFarmers();

  // Check if mobile number is already registered
  const cleanMobile = farmerData.mobile.trim();
  const existingMobile = farmers.find(f => f.mobile === cleanMobile);
  if (existingMobile) {
    return {
      success: false,
      message: `Mobile number ${cleanMobile} is already registered. Please login instead.`
    };
  }

  // Check if email is provided and already registered
  if (farmerData.email && farmerData.email.trim()) {
    const cleanEmail = farmerData.email.trim().toLowerCase();
    const existingEmail = farmers.find(f => f.email && f.email.toLowerCase() === cleanEmail);
    if (existingEmail) {
      return {
        success: false,
        message: `Email address ${cleanEmail} is already registered. Please login instead.`
      };
    }
  }

  // Generate unique Farmer ID
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const farmerId = `KM-2026-${randomSuffix}`;

  const newFarmer = {
    farmerId,
    name: farmerData.name.trim(),
    mobile: cleanMobile,
    email: farmerData.email ? farmerData.email.trim().toLowerCase() : '',
    password: farmerData.password,
    village: farmerData.village.trim(),
    district: farmerData.district.trim(),
    state: farmerData.state,
    preferredLanguage: farmerData.preferredLanguage,
    registeredAt: new Date().toISOString()
  };

  farmers.push(newFarmer);
  try {
    localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(farmers));
  } catch (err) {
    return {
      success: false,
      message: 'Failed to save registration in local storage.'
    };
  }

  return {
    success: true,
    message: 'Registration successful! Your farmer account has been created.',
    farmer: newFarmer
  };
}

/**
 * Validate farmer credentials and perform login
 */
export function loginFarmer(identifier, password) {
  const farmers = getRegisteredFarmers();
  const cleanIdentifier = identifier.trim().toLowerCase();

  const foundFarmer = farmers.find(f => {
    const mobileMatch = f.mobile === cleanIdentifier;
    const emailMatch = f.email && f.email.toLowerCase() === cleanIdentifier;
    return mobileMatch || emailMatch;
  });

  if (!foundFarmer) {
    return {
      success: false,
      message: 'No farmer account found with this mobile number or email.'
    };
  }

  if (foundFarmer.password !== password) {
    return {
      success: false,
      message: 'Incorrect password. Please try again or use Forgot Password.'
    };
  }

  // Set active user session
  setActiveUser(foundFarmer);

  return {
    success: true,
    message: `Welcome back, ${foundFarmer.name}!`,
    farmer: foundFarmer
  };
}

/**
 * Get active user from LocalStorage
 */
export function getActiveUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

/**
 * Set active user in LocalStorage
 */
export function setActiveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save active user', err);
  }
}

/**
 * Logout active farmer
 */
export function logoutFarmer() {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
  } catch (err) {
    console.error('Failed to remove active user', err);
  }
}

/**
 * Reset password using mobile or email
 */
export function resetFarmerPassword(identifier, newPassword) {
  const farmers = getRegisteredFarmers();
  const cleanIdentifier = identifier.trim().toLowerCase();

  const index = farmers.findIndex(f => {
    const mobileMatch = f.mobile === cleanIdentifier;
    const emailMatch = f.email && f.email.toLowerCase() === cleanIdentifier;
    return mobileMatch || emailMatch;
  });

  if (index === -1) {
    return {
      success: false,
      message: 'No farmer found with this mobile number or email.'
    };
  }

  farmers[index].password = newPassword;
  try {
    localStorage.setItem(STORAGE_KEY_FARMERS, JSON.stringify(farmers));
    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    };
  } catch (err) {
    return {
      success: false,
      message: 'Failed to update password in local storage.'
    };
  }
}

export { DEFAULT_DEMO_FARMER };

