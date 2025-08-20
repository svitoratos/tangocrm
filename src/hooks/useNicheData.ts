import { useNiche } from '../contexts/NicheContext';
import { 
  creatorsDataService, 
  podcastersDataService, 
  freelancersDataService, 
  coachesDataService,
  type JournalEntry,
  type GoalEntry
} from '../services/nicheDataService';

export const useNicheData = () => {
  const { currentNiche } = useNiche();
  
  // Map plural niche forms to singular forms for API calls
  const mapNicheToApiFormat = (niche: string): string => {
    const nicheMap: { [key: string]: string } = {
      'creators': 'creator',
      'podcasters': 'podcaster',
      'freelancers': 'freelancer',
      'coaches': 'coach'
    };
    return nicheMap[niche] || niche;
  };
  
  const getDataService = () => {
    console.log(`🔧 useNicheData: currentNiche = ${currentNiche}`);
    switch (currentNiche) {
      case 'creators': 
        console.log(`🔧 useNicheData: returning creatorsDataService`);
        return creatorsDataService;
      case 'podcasters': 
        console.log(`🔧 useNicheData: returning podcastersDataService`);
        return podcastersDataService;
      case 'freelancers': 
        console.log(`🔧 useNicheData: returning freelancersDataService`);
        return freelancersDataService;
      case 'coaches': 
        console.log(`🔧 useNicheData: returning coachesDataService`);
        return coachesDataService;
      default: 
        console.log(`🔧 useNicheData: returning default creatorsDataService`);
        return creatorsDataService;
    }
  };
  
  const dataService = getDataService();
  
  console.log(`🔧 Using data service for: ${currentNiche} (API format: ${mapNicheToApiFormat(currentNiche)})`);
  
  return {
    currentNiche,
    createJournalEntry: (data: Partial<JournalEntry>) => dataService.createJournalEntry(data),
    createGoalEntry: (data: Partial<GoalEntry>) => dataService.createGoalEntry(data),
    getJournalEntries: () => dataService.getJournalEntries(),
    getGoalEntries: () => dataService.getGoalEntries(),
    updateJournalEntry: (id: string, data: Partial<JournalEntry>) => dataService.updateJournalEntry(id, data),
    updateGoalEntry: (id: string, data: Partial<GoalEntry>) => dataService.updateGoalEntry(id, data),
    deleteJournalEntry: (id: string) => dataService.deleteJournalEntry(id),
    deleteGoalEntry: (id: string) => dataService.deleteGoalEntry(id),
  };
}; 