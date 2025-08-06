
export class DistanceCalculator {
  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  static filterByDistance(
    repairers: any[], 
    userLocation: [number, number], 
    maxDistance: number
  ): any[] {
    return repairers.filter(repairer => {
      if (!repairer.lat || !repairer.lng) return false;
      const distance = this.calculateDistance(
        userLocation[1], userLocation[0],
        Number(repairer.lat), Number(repairer.lng)
      );
      return distance <= maxDistance;
    });
  }
}
