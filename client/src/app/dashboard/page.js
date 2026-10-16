'use client';

import {
    useState,
    useEffect,
    useCallback
} from 'react';
import {
    useRouter
} from 'next/navigation';
import {
    apiGetNotes,
    apiCreateNote,
    apiUpdateNote,
    apiDeleteNote,
    apiLogout,
    getUser,
    getToken,
} from '@/lib/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [notes, setNotes] = useState([]);
    const [activeNote, setActiveNote] = useState(null); // note being viewed/edited
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isNew, setIsNew] = useState(false); // true when composing a new note
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [saveMsg, setSaveMsg] = useState('');
    const [search, setSearch] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Auth guard ────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!getToken()) {
            router.replace('/login');
            return;
        }
        const u = getUser();
        setUser(u);
        loadNotes();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Data fetching ─────────────────────────────────────────────────────────

    const loadNotes = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const fetched = await apiGetNotes();
            setNotes(fetched);
            if (fetched.length > 0 && !activeNote && !isNew) {
                openNote(fetched[0]);
            }
        } catch (err) {
            if (err.message.includes('authorised')) {
                handleLogout();
            } else {
                setError('Failed to load notes. Is the server running?');
            }
        } finally {
            setLoading(false);
        }
    }, [activeNote, isNew]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Note actions ──────────────────────────────────────────────────────────

    function openNote(note) {
        setIsNew(false);
        setActiveNote(note);
        setEditTitle(note.title);
        setEditContent(note.content);
        setSaveMsg('');
    }

    function startNewNote() {
        setIsNew(true);
        setActiveNote(null);
        setEditTitle('');
        setEditContent('');
        setSaveMsg('');
    }

    async function saveNote() {
        if (!editTitle.trim()) {
            setSaveMsg('Title cannot be empty.');
            return;
        }
        setSaving(true);
        setSaveMsg('');
        try {
            if (isNew) {
                const created = await apiCreateNote(editTitle, editContent);
                setNotes((prev) => [created, ...prev]);
                setIsNew(false);
                setActiveNote(created);
                setSaveMsg('Note created.');
            } else {
                const updated = await apiUpdateNote(activeNote.id, editTitle, editContent);
                setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
                setActiveNote(updated);
                setSaveMsg('Saved.');
            }
        } catch (err) {
            setSaveMsg(`Error: ${err.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMsg(''), 2500);
        }
    }

    async function deleteNote(id) {
        if (!confirm('Delete this note?')) return;
        try {
            await apiDeleteNote(id);
            const remaining = notes.filter((n) => n.id !== id);
            setNotes(remaining);
            if (activeNote ? .id === id) {
                if (remaining.length > 0) {
                    openNote(remaining[0]);
                } else {
                    startNewNote();
                }
            }
        } catch (err) {
            setError(`Delete failed: ${err.message}`);
        }
    }

    function handleLogout() {
        apiLogout();
        router.push('/login');
    }

    // ── Filtered sidebar list ─────────────────────────────────────────────────

    const filteredNotes = notes.filter((n) =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return ( <
        div className = "flex h-screen overflow-hidden bg-gray-50 text-gray-900" >

        {
            /* ── Sidebar ── */ } <
        aside className = {
            `${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-200`
        } >
        {
            /* Sidebar header */ } <
        div className = "p-4 border-b border-gray-200 flex items-center justify-between" >
        <
        span className = "font-bold text-lg text-gray-800" > 📝Notes < /span> <
        button onClick = {
            startNewNote
        }
        className = "text-xs bg-blue-600 text-white px-2.5 py-1 rounded-md hover:bg-blue-500 transition"
        title = "New note" >
        +New <
        /button> <
        /div>

        {
            /* Search */ } <
        div className = "px-3 py-2 border-b border-gray-100" >
        <
        input type = "text"
        placeholder = "Search notes…"
        value = {
            search
        }
        onChange = {
            (e) => setSearch(e.target.value)
        }
        className = "w-full text-sm border border-gray-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500" /
        >
        <
        /div>

        {
            /* Note list */ } <
        nav className = "flex-1 overflow-y-auto p-2 space-y-1" > {
            loading && ( <
                p className = "text-xs text-gray-400 text-center py-4" > Loading… < /p>
            )
        } {
            !loading && filteredNotes.length === 0 && ( <
                p className = "text-xs text-gray-400 text-center py-4" > {
                    search ? 'No matches.' : 'No notes yet. Create one!'
                } <
                /p>
            )
        } {
            filteredNotes.map((note) => {
                const isActive = activeNote ? .id === note.id && !isNew;
                return ( <
                    div key = {
                        note.id
                    }
                    className = {
                        `group flex items-start justify-between p-2.5 rounded-lg cursor-pointer transition ${
                                    isActive
                                        ? 'bg-blue-50 border border-blue-200'
                                        : 'hover:bg-gray-100 border border-transparent'
                                }`
                    }
                    onClick = {
                        () => openNote(note)
                    } >
                    <
                    div className = "min-w-0 flex-1" >
                    <
                    p className = {
                        `text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-800'}`
                    } > {
                        note.title
                    } <
                    /p> <
                    p className = "text-xs text-gray-400 mt-0.5 truncate" > {
                        note.content ? note.content.slice(0, 50) : 'No content'
                    } <
                    /p> <
                    p className = "text-xs text-gray-300 mt-1" > {
                        formatDate(note.created_at)
                    } < /p> <
                    /div> <
                    button onClick = {
                        (e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                        }
                    }
                    className = "opacity-0 group-hover:opacity-100 ml-1 mt-0.5 text-gray-300 hover:text-red-500 text-xs transition"
                    title = "Delete note" >
                    ✕
                    <
                    /button> <
                    /div>
                );
            })
        } <
        /nav>

        {
            /* User footer */ } <
        div className = "p-3 border-t border-gray-200 flex items-center justify-between" >
        <
        div className = "min-w-0" >
        <
        p className = "text-xs font-semibold text-gray-700 truncate" > {
            user ? .username
        } < /p> <
        p className = "text-xs text-gray-400 truncate" > {
            user ? .email
        } < /p> <
        /div> <
        button onClick = {
            handleLogout
        }
        className = "text-xs text-gray-400 hover:text-red-500 ml-2 transition"
        title = "Logout" >
        Logout <
        /button> <
        /div> <
        /aside>

        {
            /* ── Main editor area ── */ } <
        div className = "flex flex-col flex-1 overflow-hidden" >

        {
            /* Toolbar */ } <
        header className = "flex items-center gap-3 px-5 py-2.5 bg-white border-b border-gray-200 flex-shrink-0" >
        <
        button onClick = {
            () => setSidebarOpen((o) => !o)
        }
        className = "text-gray-400 hover:text-gray-700 transition text-lg"
        title = "Toggle sidebar" >
        ☰
        <
        /button> <
        div className = "flex-1 text-sm text-gray-400" > {
            isNew ? 'New note' : activeNote ? activeNote.title : 'Select a note'
        } <
        /div> {
            saveMsg && ( <
                span className = {
                    `text-xs px-2 py-1 rounded ${saveMsg.startsWith('Error') ? 'text-red-600 bg-red-50' : 'text-green-700 bg-green-50'}`
                } > {
                    saveMsg
                } <
                /span>
            )
        } {
            (isNew || activeNote) && ( <
                button onClick = {
                    saveNote
                }
                disabled = {
                    saving
                }
                className = "text-sm bg-blue-600 text-white px-3.5 py-1.5 rounded-md hover:bg-blue-500 disabled:opacity-50 transition" >
                {
                    saving ? 'Saving…' : isNew ? 'Create' : 'Save'
                } <
                /button>
            )
        } <
        /header>

        {
            /* Editor */ } <
        main className = "flex-1 overflow-y-auto p-8 bg-white" > {
            error && ( <
                div className = "max-w-3xl mx-auto mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex justify-between" > {
                    error
                } <
                button onClick = {
                    () => setError('')
                }
                className = "text-red-400 hover:text-red-600 ml-3" > ✕ < /button> <
                /div>
            )
        }

        {
            isNew || activeNote ? ( <
                div className = "max-w-3xl mx-auto" >
                <
                input type = "text"
                placeholder = "Note title…"
                value = {
                    editTitle
                }
                onChange = {
                    (e) => setEditTitle(e.target.value)
                }
                onKeyDown = {
                    (e) => e.key === 'Enter' && e.preventDefault()
                }
                className = "w-full text-3xl font-bold border-none outline-none bg-transparent text-gray-900 placeholder:text-gray-300 mb-6" /
                >
                <
                textarea placeholder = "Start writing…"
                value = {
                    editContent
                }
                onChange = {
                    (e) => setEditContent(e.target.value)
                }
                className = "w-full min-h-[60vh] text-base border-none outline-none bg-transparent text-gray-700 placeholder:text-gray-300 resize-none leading-relaxed" /
                >
                <
                /div>
            ) : (
                !loading && ( <
                    div className = "max-w-3xl mx-auto flex flex-col items-center justify-center h-full text-center pt-24" >
                    <
                    div className = "text-5xl mb-4" > 📝 < /div> <
                    h2 className = "text-xl font-semibold text-gray-700 mb-2" > {
                        notes.length === 0 ? 'No notes yet' : 'Select a note'
                    } <
                    /h2> <
                    p className = "text-gray-400 text-sm mb-6" > {
                        notes.length === 0 ?
                        'Click "+ New" in the sidebar to create your first note.' :
                            'Pick a note from the sidebar to start editing.'
                    } <
                    /p> <
                    button onClick = {
                        startNewNote
                    }
                    className = "bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-500 transition" >
                    +New Note <
                    /button> <
                    /div>
                )
            )
        } <
        /main> <
        /div> <
        /div>
    );
}