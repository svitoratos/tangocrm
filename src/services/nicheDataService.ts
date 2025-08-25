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
}

// Export niche-specific instances
export const creatorsDataService = new NicheDataService('creators');
export const podcastersDataService = new NicheDataService('podcasters');
export const freelancersDataService = new NicheDataService('freelancers');
export const coachesDataService = new NicheDataService('coaches'); 