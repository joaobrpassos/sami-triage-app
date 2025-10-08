// middleware/metrics.js
const metrics = {
    triageCount: 0,
    totalDuration: 0,
    get averageDuration() {
      return this.triageCount > 0 
        ? (this.totalDuration / this.triageCount).toFixed(2) 
        : 0;
    }
  };
  
  export const trackTriage = (duration) => {
    metrics.triageCount++;
    metrics.totalDuration += duration;
  };
  
  export const getMetrics = () => {
    return {
      triage: {
        total: metrics.triageCount,
        averageDuration: metrics.averageDuration
      }
    };
  };
  
  // In your triage service, after processing:
  const start = Date.now();
  // ... process triage
  trackTriage(Date.now() - start);