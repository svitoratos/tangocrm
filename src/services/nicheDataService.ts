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
    console.log(`📝 Creating journal entry for ${this.niche} (API: ${this.apiNiche}):`, entryData);

    // Save to database with niche filter
    const result = await this.saveEntry('journal', entryData);
    console.log(`✅ Journal entry saved for ${this.niche}:`, result);
    return result;
  }

  async createGoalEntry(entryData: Partial<GoalEntry>): Promise<GoalEntry> {
    console.log(`🎯 Creating goal entry for ${this.niche} (API: ${this.apiNiche}):`, entryData);

    const result = await this.saveEntry('goal', entryData);
    console.log(`✅ Goal entry saved for ${this.niche}:`, result);
    return result;
  }

  async getJournalEntries(): Promise<JournalEntry[]> {
    console.log(`📖 Loading journal entries for ${this.niche} (API: ${this.apiNiche})`);
    const entries = await this.getEntries('journal');
    console.log(`📖 Found ${entries.length} journal entries for ${this.niche}`);
    return entries;
  }

  async getGoalEntries(): Promise<GoalEntry[]> {
    console.log(`🎯 Loading goal entries for ${this.niche} (API: ${this.apiNiche})`);
    const entries = await this.getEntries('goal');
    console.log(`🎯 Found ${entries.length} goal entries for ${this.niche}`);
    return entries;
  }

  async updateJournalEntry(id: string, entryData: Partial<JournalEntry>): Promise<JournalEntry> {
    console.log(`📝 Updating journal entry ${id} for ${this.niche} (API: ${this.apiNiche}):`, entryData);
    const result = await this.updateEntry('journal', id, { ...entryData, niche: this.apiNiche });
    console.log(`✅ Journal entry updated for ${this.niche}:`, result);
    return result;
  }

  async updateGoalEntry(id: string, entryData: Partial<GoalEntry>): Promise<GoalEntry> {
    console.log(`🎯 Updating goal entry ${id} for ${this.niche} (API: ${this.apiNiche}):`, entryData);
    const result = await this.updateEntry('goal', id, { ...entryData, niche: this.apiNiche });
    console.log(`✅ Goal entry updated for ${this.niche}:`, result);
    return result;
  }

  async deleteJournalEntry(id: string): Promise<void> {
    console.log(`🗑️ Deleting journal entry ${id} for ${this.niche} (API: ${this.apiNiche})`);
    await this.deleteEntry('journal', id);
    console.log(`✅ Journal entry deleted for ${this.niche}`);
  }

  async deleteGoalEntry(id: string): Promise<void> {
    console.log(`🗑️ Deleting goal entry ${id} for ${this.niche} (API: ${this.apiNiche})`);
    await this.deleteEntry('goal', id);
    console.log(`✅ Goal entry deleted for ${this.niche}`);
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
    
    console.log(`📤 Sending ${type} entry to API:`, requestBody);
    
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
    console.log(`✅ API Response:`, result);
    return result;
  }

  private async getEntries(type: 'journal' | 'goal'): Promise<any[]> {
    const endpoint = type === 'journal' ? '/api/journal-entries' : '/api/goals';
    
    console.log(`📥 Fetching ${type} entries for ${this.niche} (API: ${this.apiNiche}) from: ${endpoint}`);
    
    const response = await fetch(`${endpoint}?niche=${this.apiNiche}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error fetching ${type} entries:`, errorText);
      throw new Error(`Failed to fetch ${type} entries: ${errorText}`);
    }

    const data = await response.json();
    console.log(`📥 Raw API response for ${type} entries:`, data);
    
    // Double filter to ensure niche isolation
    const filteredData = data.filter((entry: any) => {
      if (type === 'journal') {
        // For journal entries, check if niche is in tags array
        const hasNicheTag = entry.tags && entry.tags.includes(this.apiNiche);
        console.log(`🔍 Journal entry ${entry.id}: tags=${entry.tags}, hasNicheTag=${hasNicheTag}, looking for niche=${this.apiNiche}`);
        return hasNicheTag;
      } else {
        // For goals, check niche column
        const hasNicheColumn = entry.niche === this.apiNiche;
        console.log(`🔍 Goal entry ${entry.id}: niche=${entry.niche}, hasNicheColumn=${hasNicheColumn}`);
        return hasNicheColumn;
      }
    });

    console.log(`🔍 Filtered ${data.length} entries to ${filteredData.length} for ${this.niche} (API: ${this.apiNiche})`);
    return filteredData;
  }

  private async updateEntry(type: 'journal' | 'goal', id: string, entryData: any): Promise<any> {
    const endpoint = type === 'journal' ? '/api/journal-entries' : '/api/goals';
    
    // Ensure niche is included in the request body
    const requestBody = {
      ...entryData,
      niche: this.apiNiche
    };
    
    console.log(`📤 Updating ${type} entry ${id} with data:`, requestBody);
    
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
    console.log(`✅ ${type} entry updated successfully:`, result);
    return result;
  }

  private async deleteEntry(type: 'journal' | 'goal', id: string): Promise<void> {
    const endpoint = type === 'journal' ? '/api/journal-entries' : '/api/goals';
    
    console.log(`🗑️ Deleting ${type} entry ${id} from: ${endpoint}/${id}`);
    
    const response = await fetch(`${endpoint}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error deleting ${type} entry:`, errorText);
      throw new Error(`Failed to delete ${type} entry: ${errorText}`);
    }

    console.log(`✅ ${type} entry ${id} deleted successfully`);
  }
}

// Export niche-specific instances
export const creatorsDataService = new NicheDataService('creators');
export const podcastersDataService = new NicheDataService('podcasters');
export const freelancersDataService = new NicheDataService('freelancers');
export const coachesDataService = new NicheDataService('coaches');

export type { JournalEntry, GoalEntry }; 