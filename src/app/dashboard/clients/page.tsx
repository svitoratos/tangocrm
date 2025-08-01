"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building,
  Edit,
  Trash2,
  UserPlus,
  Grid3X3,
  List,
  Filter,
  MoreVertical,
  Calendar,
  MapPin,
  Star,
  Archive,
  User
} from 'lucide-react';
import { 
  fetchClients, 
  createClient, 
  updateClient, 
  deleteClient, 
  type Client 
} from '@/lib/client-service';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  value: string;
  status: 'lead' | 'client' | 'guest' | 'inactive';
  notes: string;
}

type ViewMode = 'grid' | 'list';
type StatusFilter = 'all' | 'lead' | 'client' | 'guest' | 'inactive';

// Color scheme matching dashboard cards
const colorClasses = {
  emerald: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600'
} as const

const gradientClasses = {
  emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
  orange: 'bg-gradient-to-br from-orange-50 to-orange-100',
  blue: 'bg-gradient-to-br from-blue-50 to-blue-100',
  purple: 'bg-gradient-to-br from-purple-50 to-purple-100',
  cyan: 'bg-gradient-to-br from-cyan-50 to-cyan-100'
} as const

function ClientsPageWithSearchParams() {
  const searchParams = useSearchParams();
  const activeNiche = searchParams.get('niche') || 'creator';
  const [contacts, setContacts] = useState<Client[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Form state
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    value: '',
    status: 'client',
    notes: ''
  });

  // Load clients from localStorage
  useEffect(() => {
    loadClients();
  }, [activeNiche]);

  // Handle URL parameters for adding clients (separate effect to avoid conflicts)
  useEffect(() => {
    // Check for add client parameter from URL
    const addClient = searchParams.get('addClient');
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    
    console.log('🔍 Clients page URL parameters:', { addClient, name, email });
    
    if (addClient === 'true') {
      console.log('🔍 Opening add client modal due to URL parameter');
      setIsModalOpen(true);
      if (name) setFormData(prev => ({ ...prev, name }));
      if (email) setFormData(prev => ({ ...prev, email }));
    }
  }, [searchParams]);

  // Reset modal state when component mounts (to prevent auto-opening)
  useEffect(() => {
    // Ensure modal is closed when component first loads
    setIsModalOpen(false);
    setSelectedContact(null);
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      
      const data = await fetchClients(activeNiche);
      setContacts(data);
      setFilteredContacts(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter contacts based on search query and status filter
  useEffect(() => {
    let filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, statusFilter]);

  const handleAddContact = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      value: '',
      status: 'client',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleEditContact = (contact: Client) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      address: contact.address || '',
      value: contact.value || '',
      status: contact.status,
      notes: contact.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteContact = async (id: string) => {
            if (window.confirm('Tango CRM says: Are you sure you want to delete this contact?')) {
      try {
        await deleteClient(id);
        await loadClients();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const handleArchiveContact = async (contact: Client) => {
    try {
      await updateClient(contact.id, { status: 'inactive' });
      await loadClients();
    } catch (error) {
      console.error('Error archiving contact:', error);
    }
  };

  const handleSaveContact = async () => {
    try {
      const saveData = {
        ...formData,
        status: formData.status
      };

      if (selectedContact) {
        // Update existing contact
        await updateClient(selectedContact.id, saveData);
      } else {
        // Create new contact
        await createClient(saveData, activeNiche);
      }
      
      await loadClients();
      setIsModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      lead: 'bg-blue-100 text-blue-800',
      client: 'bg-green-100 text-green-800',
      guest: 'bg-purple-100 text-purple-800',
      inactive: 'bg-gray-100 text-gray-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      lead: 'Lead',
      client: 'Client',
      guest: 'Guest',
      inactive: 'Archived',
      archived: 'Archived'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'lead': return <User className="w-4 h-4" />
      case 'client': return <Users className="w-4 h-4" />
      case 'guest': return <UserPlus className="w-4 h-4" />
      case 'inactive': return <Archive className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  // Get contact color based on status (matching dashboard color scheme)
  const getContactColor = (status: string) => {
    switch (status) {
      case 'lead': return 'blue'
      case 'client': return 'emerald'
      case 'guest': return 'purple'
      case 'inactive': return 'orange'
      default: return 'blue'
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredContacts.map((contact, index) => {
        const contactColor = getContactColor(contact.status);
        return (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.02, 
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-full w-full ${gradientClasses[contactColor as keyof typeof gradientClasses] || gradientClasses.blue}`}>
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-r ${colorClasses[contactColor as keyof typeof colorClasses] || colorClasses.blue} shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {contact.name.charAt(0).toUpperCase()}
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{contact.name}</h3>
                      <Badge className={`${getStatusColor(contact.status)} text-xs`}>
                        {getStatusLabel(contact.status)}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      {contact.status !== 'inactive' && (
                        <DropdownMenuItem onClick={() => handleArchiveContact(contact)}>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => handleDeleteContact(contact.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {contact.company && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      <span>{contact.company}</span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>

                {contact.notes && (
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{contact.notes}</p>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredContacts.map((contact, index) => {
        const contactColor = getContactColor(contact.status);
        return (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ 
              scale: 1.01, 
              y: -2,
              transition: { duration: 0.2 }
            }}
            className="group"
          >
            <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative ${gradientClasses[contactColor as keyof typeof gradientClasses] || gradientClasses.blue}`}>
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <motion.div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-r ${colorClasses[contactColor as keyof typeof colorClasses] || colorClasses.blue} shadow-lg`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {contact.name.charAt(0).toUpperCase()}
                    </motion.div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{contact.name}</h3>
                        <Badge className={`${getStatusColor(contact.status)} text-xs`}>
                          {getStatusLabel(contact.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        {contact.company && (
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            <span>{contact.company}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditContact(contact)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {contact.status !== 'inactive' && (
                          <DropdownMenuItem onClick={() => handleArchiveContact(contact)}>
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {contact.notes && (
                  <p className="text-sm text-gray-500 mt-3">{contact.notes}</p>
                )}
              </div>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Contacts</h1>
          <p className="text-sm text-muted-foreground">
            Manage your {activeNiche} contacts and clients
          </p>
        </div>
        <Button onClick={handleAddContact} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contact
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ 
            scale: 1.02, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 w-full ${gradientClasses.blue}`}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.blue} text-white shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Users className="w-6 h-6" />
                </motion.div>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Contacts</h3>
                <motion.p 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {contacts.length}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ 
            scale: 1.02, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 w-full ${gradientClasses.emerald}`}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.emerald} text-white shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <User className="w-6 h-6" />
                </motion.div>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Clients</h3>
                <motion.p 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {contacts.filter(c => c.status === 'client').length}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>

        {activeNiche === 'podcaster' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ 
              scale: 1.02, 
              y: -5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.98 }}
            className="group"
          >
            <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 w-full ${gradientClasses.purple}`}>
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.purple} text-white shadow-lg`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <UserPlus className="w-6 h-6" />
                  </motion.div>
                </div>
                <div className="flex-1 flex flex-col justify-end">
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Guests</h3>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900 mb-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {contacts.filter(c => c.status === 'guest').length}
                  </motion.p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ 
            scale: 1.02, 
            y: -5,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.98 }}
          className="group"
        >
          <Card className={`p-6 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden relative h-48 w-full ${gradientClasses.blue}`}>
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <motion.div 
                  className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses.blue} text-white shadow-lg`}
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <UserPlus className="w-6 h-6" />
                </motion.div>
              </div>
              <div className="flex-1 flex flex-col justify-end">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Leads</h3>
                <motion.p 
                  className="text-2xl font-bold text-gray-900 mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {contacts.filter(c => c.status === 'lead').length}
                </motion.p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Search, Filter, and View Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacts</SelectItem>
              <SelectItem value="lead">Leads</SelectItem>
              <SelectItem value="client">Clients</SelectItem>
              {activeNiche === 'podcaster' && <SelectItem value="guest">Guests</SelectItem>}
              <SelectItem value="inactive">Archived</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Contacts Display */}
      {filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contacts found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' ? 'Try adjusting your search or filters' : 'Get started by adding your first contact'}
            </p>
            <Button onClick={handleAddContact} variant="outline">
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Contact
            </Button>
          </CardContent>
        </Card>
      ) : (
        viewMode === 'grid' ? renderGridView() : renderListView()
      )}

      {/* Contact Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedContact ? 'Edit Contact' : 'Add New Contact'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter contact name"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone"
                />
              </div>
            </div>

            <div>
              <Label>Company</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Value</Label>
                <Input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g., $5000"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    {activeNiche === 'podcaster' && <SelectItem value="guest">Guest</SelectItem>}
                    <SelectItem value="inactive">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this contact"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSaveContact} className="flex-1">
                {selectedContact ? 'Update' : 'Create'} Contact
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading contacts...</p>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ClientsPageWithSearchParams />
    </Suspense>
  );
}
