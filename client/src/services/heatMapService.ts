import { apiRequest } from '@/lib/queryClient';

export interface ButtonClick {
  buttonId: string;
  buttonText: string;
  page: string;
  position: { x: number; y: number };
  timestamp: string;
  userId: string;
  sessionId: string;
}

export interface HeatMapData {
  buttonId: string;
  buttonText: string;
  page: string;
  clickCount: number;
  uniqueUsers: number;
  positions: Array<{ x: number; y: number; count: number }>;
  lastClicked: string;
}

class HeatMapService {
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeGlobalClickTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeGlobalClickTracking() {
    // Track all button clicks globally
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Check if the clicked element is a button or has button-like behavior
      if (this.isTrackableElement(target)) {
        this.trackButtonClick(target, event);
      }
    });
  }

  private isTrackableElement(element: HTMLElement): boolean {
    // Track buttons, links, and elements with click handlers
    return (
      element.tagName === 'BUTTON' ||
      element.tagName === 'A' ||
      element.role === 'button' ||
      element.hasAttribute('onclick') ||
      element.classList.contains('clickable') ||
      element.classList.contains('btn') ||
      element.querySelector('button, a, [role="button"]') !== null
    );
  }

  private getElementIdentifier(element: HTMLElement): string {
    // Create unique identifier for the element
    const id = element.id;
    const className = element.className;
    const text = element.textContent?.trim().substring(0, 50) || '';
    const dataTestId = element.getAttribute('data-testid');
    
    if (id) return `id:${id}`;
    if (dataTestId) return `testid:${dataTestId}`;
    if (className) return `class:${className.split(' ')[0]}`;
    if (text) return `text:${text}`;
    
    return `element:${element.tagName.toLowerCase()}`;
  }

  private getCurrentPage(): string {
    return window.location.pathname;
  }

  private getUserId(): string {
    // Try to get user ID from various sources
    const sessionUser = sessionStorage.getItem('userId');
    const localUser = localStorage.getItem('userId');
    
    if (sessionUser) return sessionUser;
    if (localUser) return localUser;
    
    // Fallback to demo user or admin user based on current page
    const path = window.location.pathname;
    if (path.includes('admin')) return 'admin-user';
    
    return 'demo-user';
  }

  async trackButtonClick(element: HTMLElement, event: MouseEvent) {
    try {
      const buttonData: ButtonClick = {
        buttonId: this.getElementIdentifier(element),
        buttonText: element.textContent?.trim() || element.getAttribute('aria-label') || 'Unknown',
        page: this.getCurrentPage(),
        position: {
          x: event.clientX,
          y: event.clientY
        },
        timestamp: new Date().toISOString(),
        userId: this.getUserId(),
        sessionId: this.sessionId
      };

      // Send to backend immediately
      await apiRequest('/api/analytics/button-click', {
        method: 'POST',
        body: buttonData
      });

      // Also store locally as backup
      this.storeLocalHeatMapData(buttonData);
    } catch (error) {
      console.error('Failed to track button click:', error);
      // Still store locally if API fails
      const buttonData: ButtonClick = {
        buttonId: this.getElementIdentifier(element),
        buttonText: element.textContent?.trim() || 'Unknown',
        page: this.getCurrentPage(),
        position: { x: event.clientX, y: event.clientY },
        timestamp: new Date().toISOString(),
        userId: this.getUserId(),
        sessionId: this.sessionId
      };
      this.storeLocalHeatMapData(buttonData);
    }
  }

  private storeLocalHeatMapData(data: ButtonClick) {
    try {
      const existing = localStorage.getItem('heatMapData');
      const heatMapData = existing ? JSON.parse(existing) : [];
      
      heatMapData.push(data);
      
      // Keep only last 1000 clicks to avoid storage issues
      if (heatMapData.length > 1000) {
        heatMapData.splice(0, heatMapData.length - 1000);
      }
      
      localStorage.setItem('heatMapData', JSON.stringify(heatMapData));
    } catch (error) {
      console.error('Failed to store local heat map data:', error);
    }
  }

  async getHeatMapData(page?: string): Promise<HeatMapData[]> {
    try {
      const params = page ? `?page=${encodeURIComponent(page)}` : '';
      const response = await apiRequest(`/api/analytics/heatmap${params}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch heat map data:', error);
      return this.getLocalHeatMapData(page);
    }
  }

  private getLocalHeatMapData(page?: string): HeatMapData[] {
    try {
      const stored = localStorage.getItem('heatMapData');
      if (!stored) return [];
      
      const rawData: ButtonClick[] = JSON.parse(stored);
      const filtered = page ? rawData.filter(d => d.page === page) : rawData;
      
      // Aggregate data by button
      const aggregated = new Map<string, HeatMapData>();
      
      filtered.forEach(click => {
        const key = `${click.page}_${click.buttonId}`;
        
        if (!aggregated.has(key)) {
          aggregated.set(key, {
            buttonId: click.buttonId,
            buttonText: click.buttonText,
            page: click.page,
            clickCount: 0,
            uniqueUsers: new Set<string>().size,
            positions: [],
            lastClicked: click.timestamp
          });
        }
        
        const data = aggregated.get(key)!;
        data.clickCount++;
        data.lastClicked = click.timestamp > data.lastClicked ? click.timestamp : data.lastClicked;
        
        // Add position data
        const existingPos = data.positions.find(p => 
          Math.abs(p.x - click.position.x) < 20 && Math.abs(p.y - click.position.y) < 20
        );
        
        if (existingPos) {
          existingPos.count++;
        } else {
          data.positions.push({ ...click.position, count: 1 });
        }
      });
      
      return Array.from(aggregated.values());
    } catch (error) {
      console.error('Failed to process local heat map data:', error);
      return [];
    }
  }

  async getAllPagesHeatMap(): Promise<Record<string, HeatMapData[]>> {
    try {
      const response = await apiRequest('/api/analytics/heatmap/all-pages');
      return response;
    } catch (error) {
      console.error('Failed to fetch all pages heat map:', error);
      return {};
    }
  }

  async getTopClickedElements(limit: number = 10): Promise<HeatMapData[]> {
    try {
      const response = await apiRequest(`/api/analytics/heatmap/top-clicked?limit=${limit}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch top clicked elements:', error);
      return [];
    }
  }
}

export const heatMapService = new HeatMapService();
export default heatMapService;