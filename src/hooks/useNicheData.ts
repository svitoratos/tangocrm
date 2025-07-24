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
  
  const getDataService = () => {
    switch (currentNiche) {
      case 'creators': return creatorsDataService;
      case 'podcasters': return podcastersDataService;
      case 'freelancers': return freelancersDataService;
      case 'coaches': return coachesDataService;
      default: return creatorsDataService;
    }
  };
  
  const dataService = getDataService();
  
  console.log(`🔧 Using data service for: ${currentNiche}`);
  
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