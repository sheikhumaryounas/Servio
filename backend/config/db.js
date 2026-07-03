import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class LocalDB {
  constructor(collectionName) {
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this.data = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = [];
        this.save();
      }
    } catch (error) {
      console.error(`Error loading collection ${this.filePath}:`, error);
      this.data = [];
    }
  }

  save() {
    try {
      const tempPath = `${this.filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.filePath);
    } catch (error) {
      console.error(`Error saving collection ${this.filePath}:`, error);
    }
  }

  find(query = {}) {
    this.load(); // Refresh from file
    return this.data.filter(item => {
      for (const key in query) {
        // Special geospatial query simulator
        if (key === 'location' && query.location.$near) {
          const nearQuery = query.location.$near;
          const [targetLng, targetLat] = nearQuery.$geometry.coordinates;
          const maxDistance = nearQuery.$maxDistance || 5000; // default 5km

          const itemCoords = item.location?.coordinates;
          if (!itemCoords || itemCoords.length !== 2) return false;

          const [itemLng, itemLat] = itemCoords;
          const distance = getDistance(targetLat, targetLng, itemLat, itemLng);
          item.distance = distance; // inject distance for convenience
          if (distance > maxDistance) return false;
          continue;
        }

        // Standard comparison
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(query = {}) {
    const results = this.find(query);
    return results[0] || null;
  }

  findById(id) {
    return this.findOne({ id });
  }

  create(doc) {
    this.load();
    const newDoc = {
      id: doc.id || Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      ...doc,
    };
    this.data.push(newDoc);
    this.save();
    return newDoc;
  }

  findByIdAndUpdate(id, updates) {
    this.load();
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = {
        ...this.data[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.save();
      return this.data[index];
    }
    return null;
  }

  delete(id) {
    this.load();
    const initialLength = this.data.length;
    this.data = this.data.filter(item => item.id !== id);
    if (this.data.length !== initialLength) {
      this.save();
      return true;
    }
    return false;
  }
}

// Haversine formula helper for calculating distance in meters between coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

// Export database collection instances
export const db = {
  users: new LocalDB('users'),
  providers: new LocalDB('providers'),
  requests: new LocalDB('requests'),
  transactions: new LocalDB('transactions'),
};
