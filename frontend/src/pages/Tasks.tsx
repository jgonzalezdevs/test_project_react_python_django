import { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';
import { tasksApi } from '../services/api';
import { useAppSelector } from '../store/hooks';

interface Task {
  id: number;
  project: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  assignee?: number | null;
  due_date?: string | null;
}

const emptyTask: Omit<Task, 'id'> = {
  project: 0,
  name: '',
  description: '',
  status: 'pending',
  assignee: null,
  due_date: '',
};

const Tasks = () => {
  const { user } = useAppSelector((s) => s.auth);
  const canWrite = user?.role === 'admin' || user?.role === 'collaborator';

  const [rows, setRows] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyTask);
  const [editId, setEditId] = useState<number | null>(null);

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentTaskId, setCommentTaskId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await tasksApi.list();
      setRows(data.results ?? data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Failed to load tasks');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (row?: Task) => {
    if (row) { setEditId(row.id); setForm({ ...row }); }
    else { setEditId(null); setForm(emptyTask); }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) await tasksApi.update(editId, form);
      else await tasksApi.create(form);
      setOpen(false);
      await load();
    } catch (e: any) { setError(e?.response?.data ?? 'Save failed'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksApi.remove(id); await load(); } catch (e: any) { setError(e?.response?.data ?? 'Delete failed'); }
  };

  const openComments = (taskId: number) => {
    setCommentTaskId(taskId);
    setCommentText('');
    setCommentOpen(true);
  };

  const addComment = async () => {
    if (!commentTaskId) return;
    try {
      await tasksApi.addComment(commentTaskId, commentText);
      setCommentOpen(false);
    } catch (e: any) { setError(e?.response?.data ?? 'Comment failed'); }
  };

  return (
    <div className="space-y-4">
      <Box className="flex items-center justify-between">
        <Typography variant="h5">Tasks</Typography>
        {canWrite && <Button onClick={() => handleOpen()} variant="contained">New Task</Button>}
      </Box>
      {error && <Alert severity="error">{String(error)}</Alert>}
      <Paper>
        <Table size="small" aria-label="tasks table">
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assignee</TableCell>
              <TableCell>Due</TableCell>
              {canWrite && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.project}</TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.assignee ?? '-'}</TableCell>
                <TableCell>{r.due_date || '-'}</TableCell>
                <TableCell className="space-x-2">
                  <Button size="small" onClick={() => openComments(r.id)}>Comments</Button>
                  {canWrite && <Button size="small" onClick={() => handleOpen(r)}>Edit</Button>}
                  {canWrite && <Button size="small" color="error" onClick={() => handleDelete(r.id)}>Delete</Button>}
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No tasks</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Task' : 'New Task'}</DialogTitle>
        <DialogContent className="space-y-3 mt-2">
          <TextField label="Project ID" fullWidth type="number" value={form.project} onChange={(e) => setForm({ ...form, project: Number(e.target.value) })} />
          <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Description" fullWidth multiline minRows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Box className="grid grid-cols-2 gap-3">
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select labelId="status-label" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Task['status'] })}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField type="date" label="Due" InputLabelProps={{ shrink: true }} value={form.due_date || ''} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </Box>
          <TextField label="Assignee User ID" fullWidth type="number" value={form.assignee ?? ''} onChange={(e) => setForm({ ...form, assignee: e.target.value ? Number(e.target.value) : null })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={commentOpen} onClose={() => setCommentOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent className="space-y-3 mt-2">
          <TextField label="Comment" fullWidth multiline minRows={3} value={commentText} onChange={(e) => setCommentText(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentOpen(false)}>Cancel</Button>
          <Button onClick={addComment} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Tasks;
