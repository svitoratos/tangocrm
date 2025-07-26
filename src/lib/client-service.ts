export interface Client {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  value?: string;
  status: 'lead' | 'client' | 'guest' | 'inactive';
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  niche: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  value?: string;
  status?: 'lead' | 'client' | 'guest' | 'inactive';
  notes?: string;
  tags?: string[];
}

// Local storage key
const CLIENTS_KEY = 'tango-clients';

// Generate a simple ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get all clients for the current user
export async function fetchClients(niche?: string): Promise<Client[]> {
  try {
    const stored = localStorage.getItem(CLIENTS_KEY);
    let clients: Client[] = [];
    
    if (stored) {
      clients = JSON.parse(stored);
    }
    
    // Filter by niche if provided
    const filtered = niche ? clients.filter(client => client.niche === niche) : clients;
    
    return filtered;
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

// Create a new client
export async function createClient(clientData: CreateClientData, niche: string): Promise<Client> {
  try {
    const newClient: Client = {
      id: generateId(),
      user_id: 'local-user',
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      company: clientData.company,
      address: clientData.address,
      value: clientData.value,
      status: clientData.status || 'client',
      notes: clientData.notes,
      tags: clientData.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      niche
    };
    
    // Get existing clients
    const existing = await fetchClients();
    existing.push(newClient);
    
    // Save to local storage
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(existing));
    
    return newClient;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

// Update an existing client
export async function updateClient(id: string, clientData: Partial<CreateClientData>): Promise<Client> {
  try {
    const clients = await fetchClients();
    const index = clients.findIndex(client => client.id === id);
    
    if (index === -1) {
      throw new Error('Client not found');
    }
    
    // Update the client
    clients[index] = {
      ...clients[index],
      ...clientData,
      updated_at: new Date().toISOString()
    };
    
    // Save back to local storage
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
    
    return clients[index];
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

// Delete a client
export async function deleteClient(id: string): Promise<void> {
  try {
    const clients = await fetchClients();
    const filtered = clients.filter(client => client.id !== id);
    
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

// Clear all data (for testing)
export function clearAllClients() {
  localStorage.removeItem(CLIENTS_KEY);
}
