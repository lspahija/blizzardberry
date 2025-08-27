'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import { Badge } from '@/app/(frontend)/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/(frontend)/components/ui/table';

// Sample ticket data
const ticketsData = [
  {
    id: '#12847',
    subject: 'Payment Processing Error',
    status: 'open',
    priority: 'high',
    statusColor: 'bg-orange-500',
  },
  {
    id: '#12846',
    subject: 'Billing Question',
    status: 'resolved',
    priority: 'low',
    statusColor: 'bg-emerald-500',
  },
  {
    id: '#12845',
    subject: 'Feature Request',
    status: 'resolved',
    priority: 'low',
    statusColor: 'bg-purple-500',
  },
];

const statsData = [
  { label: 'Total', value: 3, color: 'text-indigo-600' },
  { label: 'Resolved', value: 2, color: 'text-emerald-600' },
  { label: 'Open', value: 1, color: 'text-orange-600' },
];

export default function DemoSupportTicketsPage() {
  const [animateStats, setAnimateStats] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-transparent">
            Open
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-transparent">
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-800 border-transparent">
            High
          </Badge>
        );
      case 'low':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-transparent">
            Low
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-transparent">
            Medium
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 via-card to-muted/10 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
            Support Tickets
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Today's Overview
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <Card
              key={stat.label}
              className="hover:shadow-md transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketsData.map((ticket) => (
                  <TableRow key={ticket.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 ${ticket.statusColor} rounded-full`}
                        ></div>
                        <span className="font-semibold">{ticket.id}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
