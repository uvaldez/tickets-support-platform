import React, { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import SupportTicketDetails from "./SupportTicketDetails";
import { useGetTickets, TicketDto, TicketStatus } from "../hooks/useApi";

export default function SupportTickets() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);

  const { data: tickets, isLoading, error } = useGetTickets(statusFilter);

  const handleViewDetails = (id: string) => {
    setSelectedTicket(selectedTicket === id ? null : id);
    if (selectedTicket !== id) {
      queryClient.invalidateQueries({queryKey: ['ticket', id]});
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as TicketStatus);
    // Reset to first page when filter changes
    setPage(0);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {(error as Error).message}</div>;

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Support Tickets
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter || ''} onChange={handleStatusFilterChange}>
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
          </Select>
        </FormControl>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Assignee</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(tickets as TicketDto[])?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((ticket) => (
                <React.Fragment key={ticket.id}>
                  <TableRow>
                    <TableCell>{ticket.subject}</TableCell>
                    <TableCell>{ticket.priority}</TableCell>
                    <TableCell>{ticket.status}</TableCell>
                    <TableCell>{ticket.assignedTo?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        onClick={() => handleViewDetails(ticket.id)}
                      >
                        {selectedTicket === ticket.id ? "Hide Details" : "View Details"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {selectedTicket === ticket.id && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <SupportTicketDetails ticket={ticket} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={(tickets as TicketDto[])?.length || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Container>
  );
}