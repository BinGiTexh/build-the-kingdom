import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserTypeSelectionModal from '../../components/Registration/UserTypeModal';
import RegistrationForm from '../../components/Registration/RegistrationForm';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [showUserTypeModal, setShowUserTypeModal] = useState(true);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
    setShowUserTypeModal(false);
    setShowRegistrationForm(true);
  };

  const handleBackToUserType = () => {
    setShowRegistrationForm(false);
    setSelectedUserType(null);
    setShowUserTypeModal(true);
  };

  const handleRegistrationComplete = async (userType, formData) => {
    try {
      // Here you would typically make an API call to register the user
      console.log('Registration data:', { userType, ...formData });
      
      // Simulate successful registration and auto-login
      const userData = {
        id: Date.now(),
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        userType: userType,
        ...formData
      };
      
      // Auto-login the user
      login(userData);
      
      // Redirect to appropriate dashboard
      if (userType === 'employer') {
        navigate('/employer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      // Handle registration error
    }
  };

  const handleCloseModal = () => {
    navigate('/');
  };

  return (
    <>
      <UserTypeSelectionModal
        isOpen={showUserTypeModal}
        onClose={handleCloseModal}
        onUserTypeSelect={handleUserTypeSelect}
      />
      
      {showRegistrationForm && (
        <RegistrationForm
          userType={selectedUserType}
          onBack={handleBackToUserType}
          onComplete={handleRegistrationComplete}
        />
      )}
    </>
  );
};

export { RegisterPage };

