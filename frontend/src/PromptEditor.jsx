import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPromptDetails, fetchPromptHistory, createNewVersion, restoreVersion } from './api';
import { 
    Save, 
    ChevronLeft, 
    History, 
    Calendar, 
    CheckCircle, 
    AlertCircle, 
    Clock,
    RotateCcw
} from 'lucide-react';

export default function PromptEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // State
    const [prompt, setPrompt] = useState(null);
    const [content, setContent] = useState('');
    const [history, setHistory] = useState([]);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Load both Details and History at once
    const loadAllData = async () => {
        try {
            const [detailsRes, historyRes] = await Promise.all([
                fetchPromptDetails(id),
                fetchPromptHistory(id)
            ]);
            setPrompt(detailsRes.data);
            setContent(detailsRes.data.latest_version?.content || '');
            setHistory(historyRes.data);
        } catch (err) {
            setStatus({ type: 'error', msg: 'Failed to load prompt data.' });
        }
    };

    useEffect(() => {
        loadAllData();
    }, [id]);

    const handleSave = async () => {
        if (!content.trim()) return;
        setSaving(true);
        setStatus({ type: '', msg: '' });
        
        try {
            const response = await createNewVersion(id, content);
            setStatus({ type: 'success', msg: `Saved Version ${response.data.version_num}` });
            await loadAllData(); 
        } catch (err) {
            setStatus({ type: 'error', msg: 'Error saving new version.' });
        } finally {
            setSaving(false);
        }
    };

    const previewVersion = (version) => {
        setContent(version.content);
        setStatus({ 
            type: 'info', 
            msg: `Viewing Version ${version.version_num} (unsaved changes if you edit)` 
        });
    };

    // FIX: Renamed from restoreVersion to handleRestore to avoid naming collision
    const handleRestore = async (versionId) => {
        setSaving(true);
        try {
            // This now correctly calls the IMPORTED restoreVersion from api.js
            await restoreVersion(id, versionId);
            setStatus({ type: 'success', msg: 'Successfully restored to a new version!' });
            await loadAllData();
        } catch (err) {
            setStatus({ type: 'error', msg: 'Error restoring version.' });
        } finally {
            setSaving(false);
        }
    };

    if (!prompt) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse text-gray-400">Loading Editor...</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 bg-white border-b px-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="overflow-hidden">
                            <h1 className="text-lg font-bold text-gray-900 truncate">{prompt.name}</h1>
                            <p className="text-[10px] text-gray-500 font-mono truncate">ID: {id}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {status.msg && (
                            <span className={`text-xs font-medium flex items-center gap-1 ${
                                status.type === 'error' ? 'text-red-500' : 
                                status.type === 'success' ? 'text-green-600' : 'text-blue-600'
                            }`}>
                                {status.type === 'error' ? <AlertCircle size={14}/> : <CheckCircle size={14}/>}
                                {status.msg}
                            </span>
                        )}
                        <button 
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition shadow-sm font-semibold text-sm"
                        >
                            <Save size={16} /> {saving ? 'Saving...' : 'Save Version'}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden p-6">
                    <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
                        <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center rounded-t-xl">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">System Instructions</span>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                Latest: v{prompt.latest_version?.version_num}
                            </span>
                        </div>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="flex-1 w-full p-6 font-mono text-sm text-gray-800 outline-none resize-none leading-relaxed"
                            placeholder="Type your prompt logic here..."
                        />
                    </div>
                </main>
            </div>

            <aside className="w-72 bg-white border-l flex flex-col shrink-0 overflow-hidden">
                <div className="p-4 border-b flex items-center gap-2 font-bold text-gray-700 bg-gray-50/50">
                    <History size={18} className="text-blue-600" />
                    <span className="text-sm">Version History</span>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {history.map((v) => (
                        <div key={v.id} className="group relative border-b border-gray-100">
                            <button
                                onClick={() => previewVersion(v)}
                                className="w-full text-left p-4 hover:bg-blue-50/50 transition-all"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-gray-900 text-sm">Version {v.version_num}</span>
                                    {v.version_num === prompt.latest_version?.version_num ? (
                                        <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-black">ACTIVE</span>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Stop the preview from firing
                                                handleRestore(v.id);
                                            }}
                                            className="hidden group-hover:flex items-center gap-1 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-700 transition"
                                        >
                                            <RotateCcw size={10} /> Restore
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <Clock size={12} />
                                    <span className="text-[11px]">
                                        {new Date(v.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </button>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
}