import React, { useState } from 'react';
import { registerUser } from './api';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(formData.email, formData.password, formData.fullName);
            setStatus('Account created! You can now login.');
        } catch (err) {
            setStatus('Error: ' + err.response?.data?.detail || 'Something went wrong');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <UserPlus className="text-blue-600" size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create your Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative mt-1">
                            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="email" 
                                className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input 
                                type="password" 
                                className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required 
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold">
                        Sign Up
                    </button>
                </form>
                {status && <p className="mt-4 text-center text-sm font-medium text-blue-600">{status}</p>}
            </div>
        </div>
    );
}