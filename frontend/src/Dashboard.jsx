import React, { useState, useEffect } from 'react';
import { PlusCircle, FileText, Loader2 } from 'lucide-react';
import { fetchPrompts, createPrompt } from './api';
import CreatePromptModal from './CreatePromptModal';

export default function Dashboard() {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadPrompts = async () => {
        try {
            const response = await fetchPrompts();
            setPrompts(response.data);
        } catch (err) {
            console.error("Failed to load prompts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPrompts();
    }, []);

    const handleCreate = async (name, content) => {
        try {
            await createPrompt(name, content);
            setIsModalOpen(false);
            loadPrompts(); // Refresh the list from the DB
        } catch (err) {
            alert("Error creating prompt. Check if the name is unique!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Your Prompt Registry</h1>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition"
                    >
                        <PlusCircle size={20} /> New Prompt
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
                ) : prompts.length === 0 ? (
                    <div className="text-center mt-20 bg-white p-12 rounded-xl border-2 border-dashed">
                        <p className="text-gray-500 text-lg">No prompts found. Create your first one to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {prompts.map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <FileText className="text-blue-500 mb-4" size={24} />
                                <h3 className="text-xl font-bold text-gray-800">{p.name}</h3>
                                <p className="text-gray-500 text-sm mt-1 font-mono">/{p.slug}</p>
                                <div className="mt-4 pt-4 border-t flex justify-between text-xs text-gray-400 font-medium">
                                    <span>Created {new Date(p.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CreatePromptModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSuccess={handleCreate} 
            />
        </div>
    );
}