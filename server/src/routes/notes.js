const express = require('express');
const supabase = require('../config/supabase');
const {
    protect
} = require('../middleware/protect');

const router = express.Router();

// All notes routes are protected
router.use(protect);

// @desc    Get all notes for the logged-in user
// @route   GET /api/notes
// @access  Private
router.get('/', async (req, res) => {
    try {
        const {
            data: notes,
            error
        } = await supabase
            .from('notes')
            .select('id, title, content, created_at')
            .eq('user_id', req.user.id)
            .order('created_at', {
                ascending: false
            });

        if (error) {
            console.error('Fetch notes error:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch notes'
            });
        }

        res.status(200).json({
            success: true,
            count: notes.length,
            notes
        });
    } catch (err) {
        console.error('Get notes error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Get a single note by id
// @route   GET /api/notes/:id
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const {
            data: note,
            error
        } = await supabase
            .from('notes')
            .select('id, title, content, created_at')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id) // ensure ownership
            .single();

        if (error || !note) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            note
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
router.post('/', async (req, res) => {
    const {
        title,
        content
    } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Title is required'
        });
    }

    try {
        const {
            data: note,
            error
        } = await supabase
            .from('notes')
            .insert([{
                title: title.trim(),
                content: content || '',
                user_id: req.user.id,
            }])
            .select('id, title, content, created_at')
            .single();

        if (error) {
            console.error('Create note error:', error.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to create note'
            });
        }

        res.status(201).json({
            success: true,
            note
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
router.put('/:id', async (req, res) => {
    const {
        title,
        content
    } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            success: false,
            error: 'Title is required'
        });
    }

    try {
        // Verify ownership first
        const {
            data: existing
        } = await supabase
            .from('notes')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        const {
            data: note,
            error
        } = await supabase
            .from('notes')
            .update({
                title: title.trim(),
                content: content || ''
            })
            .eq('id', req.params.id)
            .select('id, title, content, created_at')
            .single();

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to update note'
            });
        }

        res.status(200).json({
            success: true,
            note
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        // Verify ownership first
        const {
            data: existing
        } = await supabase
            .from('notes')
            .select('id')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: 'Note not found'
            });
        }

        const {
            error
        } = await supabase
            .from('notes')
            .delete()
            .eq('id', req.params.id);

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Failed to delete note'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Note deleted'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// @desc    Summarise a note using Groq AI
// @route   POST /api/notes/:id/summarise
// @access  Private
router.post('/:id/summarise', async (req, res) => {
    try {
        const { data: note, error } = await supabase
            .from('notes')
            .select('id, title, content')
            .eq('id', req.params.id)
            .eq('user_id', req.user.id)
            .single();

        if (error || !note) {
            return res.status(404).json({ success: false, error: 'Note not found' });
        }

        if (!note.content || note.content.trim().length < 20) {
            return res.status(400).json({ success: false, error: 'Note content is too short to summarise' });
        }

        const { generateSummary } = require('../services/groqService');
        const summary = await generateSummary(note.content);

        res.status(200).json({ success: true, summary });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message || 'Server error' });
    }
});

module.exports = router;