interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  niche: string;
  is_favorite?: boolean;
  prompt?: string;
  created_at: string;
  updated_at: string;
}

interface GoalEntry {
  id: string;
  title: string;
  description: string;
  deadline?: string;
  status: string;
  category: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  niche: string;
  created_at: string;
  updated_at: string;
}

class NicheDataService {
  private niche: string;
  private apiNiche: string;

  constructor(niche: string) {
    this.niche = niche;
    // Map plural niche forms to singular forms for API calls
    this.apiNiche = this.mapNicheToApiFormat(niche);
  }

  private mapNicheToApiFormat(niche: string): string {
    const nicheMap: { [key: string]: string } = {
      'creators': 'creator',
      'podcasters': 'podcaster',
      'freelancers': 'freelancer',
      'coaches': 'coach'
    };
    return nicheMap[niche] || niche;
  }

  async createJournalEntry(entryData: Partial<JournalEntry>): Promise<JournalEntry> {
    // Save to database with niche filter
    const result = await this.saveEntry('journal', entryData);
    return result;
  }

  async createGoalEntry(entryData: Partial<GoalEntry>): Promise<GoalEntry> {
    const result = await this.saveEntry('goal', entryData);
    return result;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    const entries = await this.getEntries('journal');
    return entries;
  }

  async getGoalEntries(): Promise<GoalEntry[]> {
    const entries = await this.getEntries('goal');
    return entries;
  }

  async updateJournalEntry(id: string, entryData: Partial<JournalEntry>): Promise<JournalEntry> {
    const result = await this.updateEntry('journal', id, { ...entryData, niche: this.apiNiche });
    return result;
  }

  async updateGoalEntry(id: string, entryData: Partial<GoalEntry>): Promise<GoalEntry> {
    const result = await this.updateEntry('goal', id, { ...entryData, niche: this.apiNiche });
    return result;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    await this.deleteEntry('journal', id);
  }

  async deleteGoalEntry(id: string): Promise<void> {
    await this.deleteEntry('goal', id);
  }

  private async saveEntry(type: 'journal' | 'goal', entryData: any): Promise<any> {
    const endpoint = type === 'journal' ? '/api/journal-entries' : '/api/goals';
    
    // For journal entries, we need to send tags array with niche
    const requestBody = type === 'journal' 
      ? {
          title: entryData.title,
          content: entryData.content,
          mood: entryData.mood,
          tags: [this.apiNiche], // Store niche in tags array (use API format)
          niche: this.apiNiche
        }
      : {
          ...entryData,
          niche: this.apiNiche
        };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error:`, errorText);
      throw new Error(`Failed to save ${type} entry: ${errorText}`);
    }

    const result = await response.json();
    return result;
  }

  private async getEntries(type: 'journal' | 'goal'): Promise<any[]> {
    const endpoint = type === 'journal' ? '/api/journal-entries' : '/api/goals';
    
    console.log(`🔧 SERVICE: this.niche = ${this.niche}, this.apiNiche = ${this.apiNiche}`);
    console.log(`🔧 SERVICE: Fetching ${type} entries from: ${endpoint}?niche=${this.apiNiche}`);
    
    const response = await fetch(`${endpoint}?niche=${this.apiNiche}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error fetching ${type} entries:`, errorText);
      throw new Error(`Failed to fetch ${type} entries: ${errorText}`);
    }

    const data = await response.json();
    console.log(`🔧 SERVICE: Raw API response for ${type} entries:`, data);
    
    // Double filter to ensure niche isolation
    const filteredData = data.filter((entry: any) => {
      if (type === 'journal') {
        // For journal entries, check if niche is in tags array
        const hasNicheTag = entry.tags && entry.tags.includes(this.apiNiche);
        console.log(`🔧 SERVICE: Journal entry ${entry.id}: tags=${entry.tags}, hasNicheTag=${hasNicheTag}, looking for niche=${this.apiNiche}`);
        return hasNicheTag;
      } else {
        // For goals, check niche column
        const hasNicheColumn = entry.niche === this.apiNiche;
        console.log(`🔧 SERVICE: Goal entry ${entry.id}: niche=${entry.niche}, hasNicheColumn=${hasNicheColumn}`);
        return hasNicheColumn;
      }
    });

    console.log(`🔧 SERVICE: Filtered ${data.length} entries to ${filteredData.length} for ${this.niche} (API: ${this.apiNiche})`);
    return filteredData;
  }

  private async updateEntry(type: 'journal' | 'goal', id: string, entryData: any): Promise<any> {
    const endpoint = type === 'journal' ? '/api/journal-entries' : '/api/goals';
    
    // Ensure niche is included in the request body
    const requestBody = {
      ...entryData,
      niche: this.apiNiche
    };
    
    const response = await fetch(`${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error updating ${type} entry:`, errorText);
      throw new Error(`Failed to update ${type} entry: ${errorText}`);
    }

    const result = await response.json();
    return result;
  }

  private async deleteEntry(type: 'journal' | 'goal', id: string): Promise<void> {
    const endpoint = type === 'journal' ? '/api/journal-entries' : '/api/goals';
    
    const response = await fetch(`${endpoint}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error deleting ${type} entry:`, errorText);
      throw new Error(`Failed to delete ${type} entry: ${errorText}`);
    }
  }
}

// Export niche-specific instances
export const creatorsDataService = new NicheDataService('creators');
export const podcastersDataService = new NicheDataService('podcasters');
export const freelancersDataService = new NicheDataService('freelancers');
export const coachesDataService = new NicheDataService('coaches');

export type { JournalEntry, GoalEntry }; 