/**
 * Ration Saathi - Central State Store
 * Client-side only. Does NOT persist citizen PII (name, mobile, ration ID, images) to localStorage.
 * Syncs step navigation with URL hash (#step-1 ... #report) for browser Back/Forward support.
 */

export interface DeliveryEntry {
  id: string;
  date: string;
  vendorId: string;
  commodity: 'Wheat' | 'Rice' | 'Sugar';
  qty: number;
}

export interface EvidenceState {
  mode: 'img' | 'id';
  file: {
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null;
  rationId: string;
  remarks: string;
}

export interface BeneficiaryProfile {
  name: string;
  mobile: string;
  rationId: string;
  category: 'Orange' | 'Yellow' | 'White' | 'AAY' | '';
}

export interface AppState {
  signedIn: boolean;
  username: string;
  profile: BeneficiaryProfile;
  deliveries: DeliveryEntry[];
  evidence: EvidenceState;
  currentStep: number;
  reportRef: string;
  reportTimestamp: string;
}

const STEP_HASHES: Record<number, string> = {
  1: '#step-1',
  2: '#step-2',
  3: '#step-3',
  4: '#step-4',
  5: '#report'
};

const HASH_TO_STEP: Record<string, number> = {
  '#step-1': 1,
  '#step-2': 2,
  '#step-3': 3,
  '#step-4': 4,
  '#report': 5,
  '#step-5': 5
};

class Store {
  private state: AppState = {
    signedIn: false,
    username: '',
    profile: {
      name: '',
      mobile: '',
      rationId: '',
      category: ''
    },
    deliveries: [],
    evidence: {
      mode: 'img',
      file: null,
      rationId: '',
      remarks: ''
    },
    currentStep: 1,
    reportRef: '',
    reportTimestamp: ''
  };

  private listeners: Set<(state: AppState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.handleHashChange());
    }
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach(fn => fn(currentState));
  }

  public setStep(step: number, updateHash = true) {
    if (step < 1 || step > 5) return;
    this.state.currentStep = step;
    if (updateHash && typeof window !== 'undefined') {
      const hash = STEP_HASHES[step] || '#step-1';
      if (window.location.hash !== hash) {
        history.pushState(null, '', hash);
      }
    }
    this.notify();
  }

  public handleHashChange() {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash || '#step-1';
    const targetStep = HASH_TO_STEP[hash] || 1;
    // Guard navigation: require sign-in for steps > 1
    if (targetStep > 1 && !this.state.signedIn) {
      this.setStep(1);
      return;
    }
    // Guard profile completion for steps > 2
    if (targetStep > 2 && (!this.state.profile.name || !this.state.profile.category)) {
      this.setStep(2);
      return;
    }
    this.state.currentStep = targetStep;
    this.notify();
  }

  public setAuth(username: string) {
    this.state.signedIn = true;
    this.state.username = username;
    this.notify();
  }

  public setProfile(profile: Partial<BeneficiaryProfile>) {
    this.state.profile = { ...this.state.profile, ...profile };
    // Auto sync evidence ration ID with profile ration ID if not manually entered
    if (profile.rationId && !this.state.evidence.rationId) {
      this.state.evidence.rationId = profile.rationId;
    }
    this.notify();
  }

  public addDelivery(entry: Omit<DeliveryEntry, 'id'>): { success: boolean; duplicate?: boolean; id: string } {
    const isDuplicate = this.state.deliveries.some(
      e => e.date === entry.date && e.vendorId === entry.vendorId && e.commodity === entry.commodity
    );
    const id = 'del_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    this.state.deliveries.push({ id, ...entry });
    this.notify();
    return { success: true, duplicate: isDuplicate, id };
  }

  public updateDelivery(id: string, updated: Partial<Omit<DeliveryEntry, 'id'>>) {
    const index = this.state.deliveries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.state.deliveries[index] = { ...this.state.deliveries[index], ...updated };
      this.notify();
    }
  }

  public deleteDelivery(id: string) {
    this.state.deliveries = this.state.deliveries.filter(e => e.id !== id);
    this.notify();
  }

  public clearDeliveries() {
    this.state.deliveries = [];
    this.notify();
  }

  public setEvidence(evidence: Partial<EvidenceState>) {
    this.state.evidence = { ...this.state.evidence, ...evidence };
    this.notify();
  }

  public generateReport(): { ref: string; timestamp: string } {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const ref = `RS-${yyyy}${mm}${dd}-${rand}`;
    const timestamp = today.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    this.state.reportRef = ref;
    this.state.reportTimestamp = timestamp;
    this.notify();
    return { ref, timestamp };
  }

  public resetReportState() {
    // Preserves profile in memory, clears deliveries, evidence, and report info
    this.state.deliveries = [];
    this.state.evidence = {
      mode: 'img',
      file: null,
      rationId: this.state.profile.rationId,
      remarks: ''
    };
    this.state.reportRef = '';
    this.state.reportTimestamp = '';
    this.setStep(4);
  }
}

export const store = new Store();
