import { useEffect, useState } from 'react';
import { Box, Button, Paper, TextField, Typography, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Select, InputLabel, FormControl, Alert } from '@mui/material';
import { projectsApi } from '../services/api';
import { useAppSelector } from '../store/hooks';

interface Project {
  id: number;
  name: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

const emptyProject: Omit<Project, 'id'> = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  status: 'pending',
};

const Projects = () => {
  const { user } = useAppSelector((s) => s.auth);
  const canWrite = user?.role === 'admin' || user?.role === 'collaborator';

  const [rows, setRows] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyProject);
  const [editId, setEditId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await projectsApi.list();
      setRows(data.results ?? data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Failed to load projects');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleOpen = (row?: Project) => {
    if (row) { setEditId(row.id); setForm({ ...row }); }
    else { setEditId(null); setForm(emptyProject); }
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editId) await projectsApi.update(editId, form);
      else await projectsApi.create(form);
      setOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.response?.data ?? 'Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this project?')) return;
    try { await projectsApi.remove(id); await load(); } catch (e: any) { setError(e?.response?.data ?? 'Delete failed'); }
  };

  return (
    <div className="space-y-4">
      <Box className="flex items-center justify-between">
        <Typography variant="h5">Projects</Typography>
        {canWrite && <Button onClick={() => handleOpen()} variant="contained">New Project</Button>}
      </Box>
      {error && <Alert severity="error">{String(error)}</Alert>}
      <Paper>
        <Table size="small" aria-label="projects table">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Description</TableCell>
              {canWrite && <TableCell>Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>{r.start_date || '-'}</TableCell>
                <TableCell>{r.end_date || '-'}</TableCell>
                <TableCell>{r.description}</TableCell>
                {canWrite && (
                  <TableCell className="space-x-2">
                    <Button size="small" onClick={() => handleOpen(r)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDelete(r.id)}>Delete</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={canWrite ? 6 : 5} className="text-center">No projects</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Project' : 'New Project'}</DialogTitle>
        <DialogContent className="space-y-3 mt-2">
          <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Description" fullWidth multiline minRows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Box className="grid grid-cols-2 gap-3">
            <TextField type="date" label="Start" InputLabelProps={{ shrink: true }} value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <TextField type="date" label="End" InputLabelProps={{ shrink: true }} value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </Box>
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select labelId="status-label" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Project['status'] })}>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Projects;
