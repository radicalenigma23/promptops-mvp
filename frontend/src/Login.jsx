import React, { useState } from 'react';
import { loginUser } from './api';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(email, password);
            // Save the token to local storage so we stay logged in
            localStorage.setItem('token', response.data.access_token);
            navigate('/dashboard'); 
        } catch (err) {
            setError('Invalid email or password');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 p-3 rounded-full">
                        <LogIn className="text-green-600" size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Login to PromptOps</h2>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <input 
                        type="email" placeholder="Email" 
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-green-500"
                        onChange={(e) => setEmail(e.target.value)} required 
                    />
                    <input 
                        type="password" placeholder="Password" 
                        className="w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-green-500"
                        onChange={(e) => setPassword(e.target.value)} required 
                    />
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold">
                        Enter Workspace
                    </button>
                </form>
                {error && <p className="mt-4 text-center text-red-500 text-sm">{error}</p>}
                <p className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <a href="/register" className="text-green-600 hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
}