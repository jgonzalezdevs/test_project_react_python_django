import { useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { notificationsApi } from '../services/api';

interface NotificationItem {
  id: number;
  title: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

const Notifications = () => {
  const [rows, setRows] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data } = await notificationsApi.list();
      setRows(data.results ?? data);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Failed to load notifications');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const mark = async (id: number, read: boolean) => {
    try {
      if (read) await notificationsApi.markRead(id);
      else await notificationsApi.markUnread(id);
      await load();
    } catch (e: any) { setError(e?.response?.data ?? 'Update failed'); }
  };

  return (
    <div className="space-y-4">
      <Box className="flex items-center justify-between">
        <Typography variant="h5">Notifications</Typography>
        <Button onClick={load} disabled={loading}>Refresh</Button>
      </Box>
      {error && <Alert severity="error">{String(error)}</Alert>}
      <Paper>
        <Table size="small" aria-label="notifications table">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>{r.title}</TableCell>
                <TableCell>{r.message || '-'}</TableCell>
                <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  {r.is_read ? <Chip label="Read" color="success" size="small" /> : <Chip label="Unread" color="warning" size="small" />}
                </TableCell>
                <TableCell className="space-x-2">
                  {r.is_read ? (
                    <Button size="small" onClick={() => mark(r.id, false)}>Mark Unread</Button>
                  ) : (
                    <Button size="small" onClick={() => mark(r.id, true)}>Mark Read</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No notifications</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </div>
  );
};

export default Notifications;
