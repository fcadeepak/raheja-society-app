import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'society_data.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

let mongoClient = null;
let mongoCollection = null;
let cachedDb = null;

function normalizeDb(db) {
  if (!db || typeof db !== 'object') db = {};
  db.groceryItems = (db.groceryItems || []).map(item => ({
    ...item,
    availableQty: item.availableQty !== undefined ? Number(item.availableQty) : 25
  }));
  db.restaurantItems = (db.restaurantItems || []).map(item => ({
    ...item,
    availableQty: item.availableQty !== undefined ? Number(item.availableQty) : 20
  }));
  db.residents = db.residents || [];
  db.orders = db.orders || [];
  db.clubAmenities = db.clubAmenities || [];
  db.config = db.config || {};
  db.adminPins = db.adminPins || {};
  return db;
}

function readDbFromDisk() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return normalizeDb(JSON.parse(raw));
  } catch (err) {
    console.error('Error reading db from disk:', err);
    return normalizeDb({});
  }
}

function readDb() {
  if (cachedDb) return cachedDb;
  cachedDb = readDbFromDisk();
  return cachedDb;
}

function writeDb(data) {
  try {
    cachedDb = normalizeDb(data);
    fs.writeFileSync(DB_FILE, JSON.stringify(cachedDb, null, 2), 'utf-8');

    if (mongoCollection) {
      const copy = { ...cachedDb };
      delete copy._id;
      mongoCollection.updateOne({ _id: 'main' }, { $set: copy }, { upsert: true }).catch(err => {
        console.error('MongoDB sync error:', err.message);
      });
    }
    return true;
  } catch (err) {
    console.error('Error writing db:', err);
    return false;
  }
}

async function initMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('Running with persistent local JSON database (Set MONGODB_URI to enable Cloud DB).');
    return;
  }
  try {
    const { MongoClient } = await import('mongodb');
    mongoClient = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await mongoClient.connect();
    const db = mongoClient.db('raheja_society');
    mongoCollection = db.collection('society_data');
    console.log('✅ Connected to MongoDB Atlas Cloud Database!');

    const cloudDoc = await mongoCollection.findOne({ _id: 'main' });
    if (cloudDoc) {
      delete cloudDoc._id;
      cachedDb = normalizeDb(cloudDoc);
      console.log('✅ Loaded society data from Cloud MongoDB!');
    } else {
      const localDb = readDbFromDisk();
      await mongoCollection.updateOne({ _id: 'main' }, { $set: localDb }, { upsert: true });
      cachedDb = localDb;
      console.log('✅ Seeded Cloud MongoDB with initial society data.');
    }
  } catch (err) {
    console.error('⚠️ Could not connect to MongoDB Atlas:', err.message);
    console.log('Continuing with local JSON database.');
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  const [reqPath] = req.url.split('?');

  // ----------------------------------------------------
  // REST API ENDPOINTS
  // ----------------------------------------------------
  if (reqPath.startsWith('/api/')) {
    // 1. GET Full Data (Sanitizing resident passwords)
    if (req.method === 'GET' && reqPath === '/api/data') {
      const db = readDb();
      const safeDb = {
        ...db,
        residents: (db.residents || []).map(r => {
          const safe = { ...r };
          delete safe.password;
          return safe;
        })
      };
      return sendJson(res, 200, safeDb);
    }

    // --- AUTHENTICATION ENDPOINTS ---

    // Auth: Register Resident
    if (req.method === 'POST' && reqPath === '/api/auth/register') {
      try {
        const body = await parseJsonBody(req);
        const { societyName, tower, flatNo, name, phone, password } = body;
        if (!name || !phone || !flatNo || !password) {
          return sendJson(res, 400, { success: false, message: 'Please provide name, phone, flat/villa number, and password' });
        }
        const db = readDb();
        if (!db.residents) db.residents = [];

        const cleanPhone = String(phone).replace(/[^0-9]/g, '');
        const exists = db.residents.find(r => r.phone === cleanPhone);
        if (exists) {
          return sendJson(res, 400, { success: false, message: 'An account with this mobile number already exists' });
        }

        const newResident = {
          id: 'res_' + Date.now().toString().slice(-6),
          societyName: societyName || 'Raheja Exotica',
          tower: tower || 'Tower B',
          flatNo: String(flatNo).trim(),
          name: name.trim(),
          phone: cleanPhone,
          password: String(password).trim(),
          createdAt: new Date().toISOString()
        };
        db.residents.push(newResident);
        writeDb(db);

        const safeResident = { ...newResident };
        delete safeResident.password;
        return sendJson(res, 201, {
          success: true,
          message: 'Account created successfully',
          user: safeResident,
          role: 'resident'
        });
      } catch (e) {
        return sendJson(res, 500, { success: false, message: e.message });
      }
    }

    // Auth: Login (Resident or Admin)
    if (req.method === 'POST' && reqPath === '/api/auth/login') {
      try {
        const body = await parseJsonBody(req);
        const { roleType, phone, password, adminRole, pin } = body;
        const db = readDb();

        if (roleType === 'resident') {
          const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
          const resident = (db.residents || []).find(r => r.phone === cleanPhone && String(r.password) === String(password || '').trim());
          if (!resident) {
            return sendJson(res, 401, { success: false, message: 'Invalid mobile number or password' });
          }
          const safeUser = { ...resident };
          delete safeUser.password;
          return sendJson(res, 200, {
            success: true,
            role: 'resident',
            user: safeUser
          });
        }

        if (roleType === 'admin') {
          const roleKey = adminRole === 'grocery_admin' ? 'grocery' :
                          adminRole === 'restaurant_admin' ? 'restaurant' :
                          adminRole === 'club_admin' ? 'club' : null;

          if (!roleKey) {
            return sendJson(res, 400, { success: false, message: 'Invalid admin role selected' });
          }

          const expectedPin = (db.adminPins && db.adminPins[roleKey]) || '1111';
          const enteredPin = String(pin || password || '').trim();

          if (enteredPin === expectedPin) {
            return sendJson(res, 200, {
              success: true,
              role: adminRole,
              user: { role: adminRole, name: roleKey.toUpperCase() + ' Admin' }
            });
          } else {
            return sendJson(res, 401, { success: false, message: 'Incorrect Admin Security PIN!' });
          }
        }

        return sendJson(res, 400, { success: false, message: 'Invalid login request' });
      } catch (e) {
        return sendJson(res, 500, { success: false, message: e.message });
      }
    }

    // Auth: Reset Password (Resident or Admin)
    if (req.method === 'POST' && reqPath === '/api/auth/reset-password') {
      try {
        const body = await parseJsonBody(req);
        const { roleType, phone, flatNo, adminRole, recoveryCode, newPassword } = body;
        const db = readDb();

        if (!newPassword || String(newPassword).trim().length < 3) {
          return sendJson(res, 400, { success: false, message: 'Please enter a valid new password (at least 3 characters)' });
        }

        if (roleType === 'resident') {
          const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
          const cleanFlat = String(flatNo || '').trim().toLowerCase();
          const resident = (db.residents || []).find(r => r.phone === cleanPhone && String(r.flatNo).trim().toLowerCase() === cleanFlat);

          if (!resident) {
            return sendJson(res, 404, { success: false, message: 'No matching resident found with this mobile number and flat/villa number' });
          }

          resident.password = String(newPassword).trim();
          writeDb(db);
          return sendJson(res, 200, { success: true, message: 'Password reset successfully! You can now login.' });
        }

        if (roleType === 'admin') {
          const roleKey = adminRole === 'grocery_admin' ? 'grocery' :
                          adminRole === 'restaurant_admin' ? 'restaurant' :
                          adminRole === 'club_admin' ? 'club' : null;

          if (!roleKey) {
            return sendJson(res, 400, { success: false, message: 'Invalid admin role selected' });
          }

          const masterCode = (db.adminPins && db.adminPins.masterRecoveryPin) || '9999';
          if (String(recoveryCode || '').trim() !== masterCode) {
            return sendJson(res, 401, { success: false, message: 'Invalid Master Recovery Code! (Default: 9999)' });
          }

          if (!db.adminPins) db.adminPins = {};
          db.adminPins[roleKey] = String(newPassword).trim();
          writeDb(db);
          return sendJson(res, 200, { success: true, message: `PIN updated successfully for ${roleKey} admin.` });
        }

        return sendJson(res, 400, { success: false, message: 'Invalid reset request' });
      } catch (e) {
        return sendJson(res, 500, { success: false, message: e.message });
      }
    }

    // Auth: Update Resident Profile
    if ((req.method === 'PUT' || req.method === 'POST') && reqPath === '/api/residents/profile') {
      try {
        const body = await parseJsonBody(req);
        const { id, currentPhone, phone, name, flatNo, tower, societyName } = body;
        const db = readDb();
        if (!db.residents) db.residents = [];

        // 1. Locate existing resident
        let resident = null;
        if (id) {
          resident = db.residents.find(r => r.id === id);
        }
        if (!resident && currentPhone) {
          const cleanCurrent = String(currentPhone).replace(/[^0-9]/g, '');
          resident = db.residents.find(r => r.phone === cleanCurrent);
        }
        if (!resident && phone) {
          const cleanPhone = String(phone).replace(/[^0-9]/g, '');
          resident = db.residents.find(r => r.phone === cleanPhone);
        }

        if (!resident) {
          return sendJson(res, 404, { success: false, message: 'Resident account not found' });
        }

        // 2. If phone is changing, ensure new phone is not already in use by another resident
        if (phone) {
          const cleanNewPhone = String(phone).replace(/[^0-9]/g, '');
          if (cleanNewPhone && cleanNewPhone !== resident.phone) {
            const conflict = db.residents.find(r => r.phone === cleanNewPhone && r.id !== resident.id);
            if (conflict) {
              return sendJson(res, 400, { success: false, message: 'Another resident account with this mobile number already exists' });
            }
            resident.phone = cleanNewPhone;
          }
        }

        // 3. Update profile fields
        if (name !== undefined && String(name).trim()) resident.name = String(name).trim();
        if (flatNo !== undefined && String(flatNo).trim()) resident.flatNo = String(flatNo).trim();
        if (tower !== undefined && String(tower).trim()) resident.tower = String(tower).trim();
        if (societyName !== undefined && String(societyName).trim()) resident.societyName = String(societyName).trim();
        resident.updatedAt = new Date().toISOString();

        writeDb(db);

        const safeUser = { ...resident };
        delete safeUser.password;
        return sendJson(res, 200, {
          success: true,
          message: 'Profile updated successfully',
          user: safeUser
        });
      } catch (e) {
        return sendJson(res, 500, { success: false, message: e.message });
      }
    }

    // 2. Upload Local Image
    if (req.method === 'POST' && reqPath === '/api/upload') {
      try {
        const body = await parseJsonBody(req);
        const { filename, data } = body;
        if (!data) {
          return sendJson(res, 400, { success: false, message: 'No image data provided' });
        }

        // Clean Base64 prefix
        const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const cleanName = (filename || 'photo.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
        const safeFilename = `${Date.now()}-${cleanName}`;
        const filePath = path.join(UPLOADS_DIR, safeFilename);

        fs.writeFileSync(filePath, buffer);
        const publicUrl = `/uploads/${safeFilename}`;
        return sendJson(res, 201, { success: true, url: publicUrl });
      } catch (e) {
        return sendJson(res, 500, { success: false, message: e.message });
      }
    }

    // 3. Orders API
    if (reqPath === '/api/orders') {
      const db = readDb();
      if (req.method === 'GET') {
        return sendJson(res, 200, db.orders || []);
      }
      if (req.method === 'POST') {
        try {
          const body = await parseJsonBody(req);
          const catalogList = body.type === 'restaurant' ? db.restaurantItems : db.groceryItems;

          // Validate that requested quantities do not exceed available stock
          for (const orderedItem of (body.items || [])) {
            const match = catalogList.find(i => i.id === orderedItem.id);
            if (match) {
              const available = match.availableQty !== undefined ? match.availableQty : 999;
              if (orderedItem.quantity > available) {
                return sendJson(res, 400, {
                  success: false,
                  message: `Cannot order ${orderedItem.quantity} units of "${match.name}". Only ${available} units available in stock.`
                });
              }
            }
          }

          // Deduct from stock
          for (const orderedItem of (body.items || [])) {
            const match = catalogList.find(i => i.id === orderedItem.id);
            if (match && match.availableQty !== undefined) {
              match.availableQty = Math.max(0, match.availableQty - orderedItem.quantity);
            }
          }

          const now = new Date();
          const getOrderDateKey = (isoStr) => {
            try {
              return new Date(isoStr).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
            } catch {
              return new Date(isoStr).toISOString().slice(0, 10);
            }
          };
          const todayKey = getOrderDateKey(now);
          const ordersToday = (db.orders || []).filter(o => getOrderDateKey(o.createdAt) === todayKey);
          const dailySerialNo = ordersToday.length + 1;

          const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
          const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-6),
            type: body.type || 'grocery',
            items: body.items || [],
            customNote: body.customNote || '',
            totalAmount: body.totalAmount || 0,
            resident: body.resident || {},
            deliveryPin: deliveryPin,
            dailySerialNo: dailySerialNo,
            status: 'pending',
            createdAt: now.toISOString()
          };
          if (!db.orders) db.orders = [];
          db.orders.unshift(newOrder);
          writeDb(db);
          return sendJson(res, 201, { success: true, order: newOrder });
        } catch (e) {
          return sendJson(res, 400, { success: false, error: e.message });
        }
      }
    }

    // 4. Verify Delivery PIN and Complete Order
    if (req.method === 'POST' && reqPath === '/api/orders/verify') {
      try {
        const { orderId, pin } = await parseJsonBody(req);
        const db = readDb();
        const order = (db.orders || []).find(o => o.id === orderId);

        if (!order) {
          return sendJson(res, 404, { success: false, message: 'Order not found' });
        }

        if (order.status === 'completed') {
          return sendJson(res, 200, { success: true, message: 'Order was already completed', order });
        }

        if (order.deliveryPin === (pin || '').trim()) {
          order.status = 'completed';
          order.completedAt = new Date().toISOString();
          writeDb(db);
          return sendJson(res, 200, { success: true, message: 'Delivery PIN verified! Order marked Completed.', order });
        } else {
          return sendJson(res, 400, { success: false, message: 'Incorrect Delivery PIN! Please ask the resident for the 4-digit code shown on their app.' });
        }
      } catch (e) {
        return sendJson(res, 400, { success: false, error: e.message });
      }
    }

    // 5. Grocery Items CRUD
    if (reqPath.startsWith('/api/items/grocery')) {
      const db = readDb();
      const parts = reqPath.split('/');
      const itemId = parts[4];

      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const parseItemPrice = (p) => (p === '' || p === null || p === undefined || isNaN(Number(p))) ? null : Number(p);
        const newItem = {
          id: 'g_' + Date.now().toString().slice(-6),
          name: body.name || 'New Grocery Item',
          pack: body.pack || '1 unit',
          price: parseItemPrice(body.price),
          category: body.category || 'dairy',
          img: body.img || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
          availableQty: Number(body.availableQty !== undefined ? body.availableQty : 25),
          popular: !!body.popular,
          inStock: body.inStock !== false
        };
        db.groceryItems.unshift(newItem);
        writeDb(db);
        return sendJson(res, 201, { success: true, item: newItem });
      }

      if (req.method === 'PUT' && itemId) {
        const body = await parseJsonBody(req);
        const idx = db.groceryItems.findIndex(i => i.id === itemId);
        if (idx === -1) return sendJson(res, 404, { error: 'Item not found' });
        const parseItemPrice = (p) => (p === '' || p === null || p === undefined || isNaN(Number(p))) ? null : Number(p);
        db.groceryItems[idx] = {
          ...db.groceryItems[idx],
          ...body,
          price: body.price !== undefined ? parseItemPrice(body.price) : db.groceryItems[idx].price,
          availableQty: Number(body.availableQty !== undefined ? body.availableQty : db.groceryItems[idx].availableQty)
        };
        writeDb(db);
        return sendJson(res, 200, { success: true, item: db.groceryItems[idx] });
      }

      if (req.method === 'DELETE' && itemId) {
        db.groceryItems = db.groceryItems.filter(i => i.id !== itemId);
        writeDb(db);
        return sendJson(res, 200, { success: true, deletedId: itemId });
      }
    }

    // 6. Restaurant Items CRUD
    if (reqPath.startsWith('/api/items/restaurant')) {
      const db = readDb();
      const parts = reqPath.split('/');
      const itemId = parts[4];

      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const parseItemPrice = (p) => (p === '' || p === null || p === undefined || isNaN(Number(p))) ? null : Number(p);
        const newItem = {
          id: 'r_' + Date.now().toString().slice(-6),
          name: body.name || 'New Dish',
          desc: body.desc || '',
          price: parseItemPrice(body.price),
          category: body.category || 'mains',
          isVeg: body.isVeg !== false,
          img: body.img || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
          badge: body.badge || '',
          availableQty: Number(body.availableQty !== undefined ? body.availableQty : 20),
          inStock: body.inStock !== false
        };
        db.restaurantItems.unshift(newItem);
        writeDb(db);
        return sendJson(res, 201, { success: true, item: newItem });
      }

      if (req.method === 'PUT' && itemId) {
        const body = await parseJsonBody(req);
        const idx = db.restaurantItems.findIndex(i => i.id === itemId);
        if (idx === -1) return sendJson(res, 404, { error: 'Dish not found' });
        const parseItemPrice = (p) => (p === '' || p === null || p === undefined || isNaN(Number(p))) ? null : Number(p);
        db.restaurantItems[idx] = {
          ...db.restaurantItems[idx],
          ...body,
          price: body.price !== undefined ? parseItemPrice(body.price) : db.restaurantItems[idx].price,
          availableQty: Number(body.availableQty !== undefined ? body.availableQty : db.restaurantItems[idx].availableQty)
        };
        writeDb(db);
        return sendJson(res, 200, { success: true, item: db.restaurantItems[idx] });
      }

      if (req.method === 'DELETE' && itemId) {
        db.restaurantItems = db.restaurantItems.filter(i => i.id !== itemId);
        writeDb(db);
        return sendJson(res, 200, { success: true, deletedId: itemId });
      }
    }

    // 6b. Bulk Import Items (Grocery or Restaurant) from Excel/CSV
    if (reqPath === '/api/items/bulk' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const { type, items } = body;
        if (!type || !Array.isArray(items) || items.length === 0) {
          return sendJson(res, 400, { success: false, message: 'Invalid payload: type and non-empty items array are required.' });
        }
        const db = readDb();
        const parseItemPrice = (p) => (p === '' || p === null || p === undefined || isNaN(Number(p))) ? null : Number(p);
        let addedCount = 0;

        if (type === 'grocery') {
          if (!db.groceryItems) db.groceryItems = [];
          const newItems = items.map((item, idx) => ({
            id: 'g_' + (Date.now() + idx).toString().slice(-6),
            name: String(item.name || '').trim() || 'New Grocery Item',
            pack: String(item.pack || '1 unit').trim(),
            price: parseItemPrice(item.price),
            category: String(item.category || 'dairy').trim().toLowerCase(),
            img: item.img || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
            availableQty: Number(item.availableQty !== undefined && !isNaN(Number(item.availableQty)) ? item.availableQty : 25),
            popular: !!item.popular,
            inStock: item.inStock !== false && String(item.inStock).toLowerCase() !== 'false' && String(item.inStock).toLowerCase() !== 'no'
          }));
          db.groceryItems.unshift(...newItems);
          addedCount = newItems.length;
        } else if (type === 'restaurant') {
          if (!db.restaurantItems) db.restaurantItems = [];
          const newItems = items.map((item, idx) => ({
            id: 'r_' + (Date.now() + idx).toString().slice(-6),
            name: String(item.name || '').trim() || 'New Dish',
            desc: String(item.desc || '').trim(),
            price: parseItemPrice(item.price),
            category: String(item.category || 'mains').trim().toLowerCase(),
            isVeg: item.isVeg !== false && String(item.isVeg).toLowerCase() !== 'false' && String(item.isVeg).toLowerCase() !== 'no',
            img: item.img || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
            badge: item.badge || '',
            availableQty: Number(item.availableQty !== undefined && !isNaN(Number(item.availableQty)) ? item.availableQty : 20),
            inStock: item.inStock !== false && String(item.inStock).toLowerCase() !== 'false' && String(item.inStock).toLowerCase() !== 'no'
          }));
          db.restaurantItems.unshift(...newItems);
          addedCount = newItems.length;
        } else {
          return sendJson(res, 400, { success: false, message: 'Invalid catalog type. Must be grocery or restaurant.' });
        }

        writeDb(db);
        return sendJson(res, 201, {
          success: true,
          message: `Successfully imported ${addedCount} items.`,
          addedCount
        });
      } catch (e) {
        return sendJson(res, 500, { success: false, message: e.message });
      }
    }

    // 7. Amenities Update
    if (reqPath.startsWith('/api/amenities')) {
      const db = readDb();
      const parts = reqPath.split('/');
      const amenityId = parts[3];

      if (req.method === 'PUT' && amenityId) {
        const body = await parseJsonBody(req);
        const idx = db.clubAmenities.findIndex(a => a.id === amenityId);
        if (idx === -1) return sendJson(res, 404, { error: 'Amenity not found' });
        db.clubAmenities[idx] = { ...db.clubAmenities[idx], ...body };
        writeDb(db);
        return sendJson(res, 200, { success: true, amenity: db.clubAmenities[idx] });
      }
    }

    // 8. Update Vendor Phone Numbers (Respective Admin Only)
    if (reqPath === '/api/config/phone' && (req.method === 'POST' || req.method === 'PUT')) {
      try {
        const { role, phone } = await parseJsonBody(req);
        if (!role || !phone) {
          return sendJson(res, 400, { success: false, message: 'Role and phone are required' });
        }
        const db = readDb();
        if (!db.config) db.config = {};

        const cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (role === 'grocery_admin') {
          db.config.groceryPhone = cleanPhone;
        } else if (role === 'restaurant_admin') {
          db.config.restaurantPhone = cleanPhone;
        } else if (role === 'club_admin') {
          db.config.clubHousePhone = cleanPhone;
        } else {
          return sendJson(res, 400, { success: false, message: 'Invalid admin role' });
        }
        writeDb(db);
        return sendJson(res, 200, { success: true, message: 'Store WhatsApp number updated', config: db.config });
      } catch (e) {
        return sendJson(res, 400, { success: false, error: e.message });
      }
    }

    // 9. Database Backup & Restore Endpoints
    if (req.method === 'GET' && reqPath === '/api/admin/backup') {
      const db = readDb();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="raheja_society_backup_${new Date().toISOString().slice(0, 10)}.json"`,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(db, null, 2));
      return;
    }

    if (req.method === 'POST' && reqPath === '/api/admin/restore') {
      try {
        const body = await parseJsonBody(req);
        if (!body || typeof body !== 'object') {
          return sendJson(res, 400, { success: false, message: 'Invalid backup file format' });
        }
        writeDb(body);
        return sendJson(res, 200, { success: true, message: 'Society data successfully restored!' });
      } catch (e) {
        return sendJson(res, 400, { success: false, message: 'Restore failed: ' + e.message });
      }
    }

    return sendJson(res, 404, { error: 'Endpoint not found' });
  }

  // ----------------------------------------------------
  // STATIC FILE SERVING (INCLUDING UPLOADS DIR)
  // ----------------------------------------------------
  let staticPath = reqPath === '/' || reqPath === '' ? '/index.html' : reqPath;
  const filePath = path.join(__dirname, staticPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  await initMongo();
});
