import React, { useState } from 'react';
import { Button, Input, Card } from '../ui';
import { useAuthStore } from '../../store';

interface AuthFormProps {
  onSuccess?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({
          email: formData.email,
          username: formData.username || formData.email.split('@')[0],
          password: formData.password,
        });
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Auth error:', err);
    }
  };
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
    clearError();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      {/* Mode Toggle */}
      <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            isLogin 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
            !isLogin 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        {!isLogin && (
          <Input
            type="text"
            name="username"
            label="Username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleInputChange}
            helpText="Leave empty to use email prefix"
          />
        )}

        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        {!isLogin && (
          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={
            !formData.email || 
            !formData.password || 
            (!isLogin && formData.password !== formData.confirmPassword)
          }
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </form>

      {/* Demo Link */}
      <div className="mt-6 text-center">
        <button 
          type="button"
          className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
          onClick={() => {
            // For demo purposes, we could auto-fill with demo credentials
            setFormData({
              email: 'demo@learninslices.com',
              username: 'demo',
              password: 'demo123',
              confirmPassword: 'demo123',
            });
            setIsLogin(true);
          }}
        >
          Continue with Demo
        </button>
      </div>
    </Card>
  );
};
