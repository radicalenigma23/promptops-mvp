import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreatePromptModal({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState('');
    const [content, setContent] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">New Prompt Project</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-black"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prompt Name</label>
                        <input 
                            className="w-full border border-gray-300 p-2 rounded-md mt-1 outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="e.g. Sales Email Generator"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Initial Instructions</label>
                        <textarea 
                            className="w-full border border-gray-300 p-2 rounded-md mt-1 h-32 outline-none focus:ring-2 focus:ring-blue-500" 
                            placeholder="You are an expert sales writer..."
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={() => onSuccess(name, content)}
                        className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
                    >
                        Create & Save v1
                    </button>
                </div>
            </div>
        </div>
    );
}