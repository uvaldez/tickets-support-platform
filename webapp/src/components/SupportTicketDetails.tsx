import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { TicketDto, useReplyToEmail, useUpdateTicket, useGetUsers, UserDto, TicketStatus } from "../hooks/useApi";

interface SupportTicketDetailsProps {
  ticket: TicketDto;
}

const removeHtmlTags = (str: string) => {
  if ((str===null) || (str===''))
    return '';
  else
    str = str.toString();
  return str.replace(/<[^>]*>/g, '');
};

const SupportTicketDetails: React.FC<SupportTicketDetailsProps> = ({ ticket }) => {
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assignee, setAssignee] = useState(ticket.assignedTo?.id || "");
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const replyToEmailMutation = useReplyToEmail();
  const updateTicketMutation = useUpdateTicket();
  const { data: users } = useGetUsers();

  useEffect(() => {
    setIsSaveEnabled(
      status !== ticket.status || 
      priority !== ticket.priority || 
      assignee !== ticket.assignedTo?.id
    );
  }, [status, priority, assignee, ticket.status, ticket.priority, ticket.assignedTo]);

  const handleSaveChanges = () => {
    updateTicketMutation.mutate(
      { 
        id: ticket.id, 
        data: { 
          status, 
          priority, 
          assignedToId: assignee || null
        } 
      },
      {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Changes saved successfully', severity: 'success' });
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Failed to save changes', severity: 'error' });
        },
      }
    );
  };

  const handleReplyToEmail = () => {
    const threadId = ticket.messages.length > 0 
      ? ticket.messages[ticket.messages.length - 1].threadId 
      : ticket.threadId;

    replyToEmailMutation.mutate(
      { text: reply, messageId: threadId },
      {
        onSuccess: () => {
          setSnackbar({ open: true, message: 'Reply sent successfully', severity: 'success' });
          setReply('');
        },
        onError: () => {
          setSnackbar({ open: true, message: 'Failed to send reply', severity: 'error' });
        },
      }
    );
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        Ticket Details: {ticket.subject}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Description: {ticket.description ? removeHtmlTags(ticket.description) : 'No description available'}
      </Typography>
      
      {/* Messages */}
      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        Messages
      </Typography>
      <List>
        {ticket.messages.map((message, index) => (
          <React.Fragment key={message.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={
                  <>
                    From:{' '}
                    {ticket.assignedTo 
                      ? `${ticket.assignedTo.name} (${ticket.assignedTo.email})`
                      : message.createdBy}
                  </>
                }
                secondary={
                  <React.Fragment>
                    <Typography component="span" variant="body2" color="text.primary">
                      {new Date(message.createdAt).toLocaleString()}
                    </Typography>
                    <Typography 
                      component="div" 
                      variant="body2" 
                      dangerouslySetInnerHTML={{ __html: message.body }}
                      sx={{ 
                        mt: 1, 
                        '& a': { color: 'primary.main' },
                        '& img': { maxWidth: '100%', height: 'auto' }
                      }} 
                    />
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < ticket.messages.length - 1 && <Divider component="li" />}
          </React.Fragment>
        ))}
      </List>

      {/* Reply */}
      <Box sx={{ mb: 2, mt: 2 }}>
        <TextField
          label="Reply"
          multiline
          rows={4}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <Button 
          variant="contained" 
          color="primary" 
          disabled={!reply || replyToEmailMutation.isPending}
          onClick={handleReplyToEmail}
        >
          {replyToEmailMutation.isPending ? 'Sending...' : 'Send Reply'}
        </Button>
      </Box>
      
      {/* Change status, priority, and assignee */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={(e) => setStatus(e.target.value as TicketStatus)}>
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Priority</InputLabel>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as TicketDto['priority'])}>
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Assignee</InputLabel>
          <Select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
            <MenuItem value="">
              <em>Unassigned</em>
            </MenuItem>
            {users?.map((user: UserDto) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Button 
        variant="contained" 
        color="secondary" 
        onClick={handleSaveChanges} 
        disabled={!isSaveEnabled || updateTicketMutation.isPending}
      >
        {updateTicketMutation.isPending ? 'Saving...' : 'Save Changes'}
      </Button>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupportTicketDetails;