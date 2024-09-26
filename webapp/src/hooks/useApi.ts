import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/apiClient';

// Tickets
export const useGetTickets = (status?: TicketStatus, options?: UseQueryOptions<TicketDto[], unknown, TicketDto[], string[]>) => {
  return useQuery({
    queryKey: ['tickets', status ?? 'all'],
    queryFn: () => apiClient.get('/tickets', { params: { status } }).then(res => res.data),
    ...options
  });
};

export const useGetInbox = (options?: UseQueryOptions<any, unknown, any, string[]>) => {
  return useQuery({
    queryKey: ['inbox'],
    queryFn: () => apiClient.get('/tickets/inbox').then(res => res.data),
    ...options
  });
};

export const useGetThreads = (options?: UseQueryOptions<any, unknown, any, string[]>) => {
  return useQuery({
    queryKey: ['threads'],
    queryFn: () => apiClient.get('/tickets/threads').then(res => res.data),
    ...options
  });
};

export const useGetTicket = (id: string, options?: UseQueryOptions<TicketDto, unknown, TicketDto, string[]>) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: () => apiClient.get(`/tickets/${id}`).then(res => res.data),
    ...options
  });
};

export const useUpdateTicket = (options?: UseMutationOptions<TicketDto, unknown, { id: string; data: Partial<TicketDto> }>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TicketDto> }) => 
      apiClient.put(`/tickets/${id}`, data).then(res => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['ticket', data.id], data);
      queryClient.invalidateQueries({queryKey: ['tickets']});
    },
    ...options
  });
};

export const useReplyToEmail = (options?: UseMutationOptions<ReplyToEmailDto, unknown, ReplyToEmailDto>) => {
  return useMutation({
    mutationFn: (data: ReplyToEmailDto) => apiClient.post('/tickets/reply', data).then(res => res.data),
    ...options
  });
};

// Types based on the Swagger schemas
export interface EmailDto {
  name?: string;
  to?: string;
  email: string;
  emailId: string;
  subject: string;
  body: string;
  threadId: string;
}

export interface TicketDto {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  threadId: string;
  createdBy: string;
  description: string;
  messages: MessageDto[];
  assignedTo: {
    id: string;
    email: string;
    name: string;
  } | null;
  assignedToId: string | null;
}

export interface MessageDto {
  id: string;
  threadId: string;
  subject: string;
  createdAt: string;
  emailId: string;
  body: string;
  createdBy: string;
}

export interface ReplyToEmailDto {
  text: string;
  messageId: string;
}

// Add this new hook
export const useGetUsers = (options?: UseQueryOptions<UserDto[], unknown, UserDto[], string[]>) => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users/').then(res => res.data),
    ...options
  });
};

export interface UserDto {
  id: string;
  email: string;
  name: string;
}

export type TicketStatus = 'OPEN' | 'PENDING' | 'CLOSED';