// Master Data for Raheja Society Resident App

export const DEFAULT_CONFIG = {
  societyName: "Raheja Exotica",
  towers: ["Tower A", "Tower B", "Tower C", "Tower D", "Wing 1", "Wing 2"],
  defaultGroceryPhone: "919876543210",    // Society Grocery Shop WhatsApp
  defaultRestaurantPhone: "919876543211", // Society Restaurant WhatsApp
  defaultClubHousePhone: "919876543212"   // Society Club House Desk WhatsApp
};

export const CLUB_AMENITIES = [
  {
    id: "gym",
    name: "Fitness Centre & Gymnasium",
    badge: "Open Today",
    timing: "06:00 AM - 10:00 PM",
    desc: "Fully equipped with cardio machines, free weights, certified trainers, and steam room.",
    icon: "dumbbell",
    features: ["Cardio & Free Weights", "Personal Trainers", "Steam & Sauna", "AC Workout Hall"],
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "pool",
    name: "Olympic-Length Swimming Pool",
    badge: "Temperature Controlled",
    timing: "06:30 AM - 09:30 PM (Mon Closed)",
    desc: "Crystal clean half-Olympic pool with dedicated kids wading pool and certified lifeguard.",
    icon: "waves",
    features: ["Adult Lap Pool", "Kids Splash Zone", "Shower & Lockers", "Lifeguard on Duty"],
    img: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "badminton",
    name: "Indoor Badminton Courts",
    badge: "2 Wooden Courts",
    timing: "06:00 AM - 11:00 PM",
    desc: "Two international standard synthetic wooden courts with anti-glare LED illumination.",
    icon: "trophy",
    features: ["Wooden Flooring", "Yonex Nets", "Gear Rental", "Spectator Seating"],
    img: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "banquet",
    name: "Grand Banquet & Party Hall",
    badge: "Booking Required",
    timing: "Available on slot booking",
    desc: "Luxurious air-conditioned hall for birthday celebrations, society gatherings, and private events with 150+ seating.",
    icon: "party-popper",
    features: ["150 Seating Capacity", "Pantry Area", "Audio-Visual Setup", "Attached Lawn"],
    img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: "indoor-games",
    name: "Table Tennis & Snooker Lounge",
    badge: "Open Daily",
    timing: "07:00 AM - 10:30 PM",
    desc: "Relaxing indoor gaming zone with 2 Stag TT tables, an English 8-ball pool table, carrom, and board games.",
    icon: "gamepad",
    features: ["Stag TT Tables", "8-Ball Pool Table", "Carrom Boards", "Chess & Board Games"],
    img: "https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=800&auto=format&fit=crop&q=80"
  }
];

export const GROCERY_CATEGORIES = [
  { id: "all", label: "All Items", icon: "sparkles" },
  { id: "dairy", label: "Dairy & Bakery", icon: "milk" },
  { id: "veggies", label: "Fruits & Veggies", icon: "carrot" },
  { id: "staples", label: "Pantry & Atta", icon: "wheat" },
  { id: "snacks", label: "Snacks & Drinks", icon: "cookie" },
  { id: "household", label: "Cleaning & Daily", icon: "spray-can" }
];

export const GROCERY_ITEMS = [
  // Dairy & Bakery
  {
    id: "g_milk_amul",
    name: "Amul Taaza Toned Milk",
    pack: "1 Litre Pouch",
    price: 54,
    category: "dairy",
    img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_milk_cow",
    name: "Amul Gold Full Cream Milk",
    pack: "1 Litre Pouch",
    price: 66,
    category: "dairy",
    img: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_bread_wheat",
    name: "Harvest Gold 100% Atta Bread",
    pack: "400 g Pack",
    price: 45,
    category: "dairy",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_eggs",
    name: "Farm Fresh White Eggs",
    pack: "Tray of 6 Eggs",
    price: 55,
    category: "dairy",
    img: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_curd",
    name: "Mother Dairy Classic Curd / Dahi",
    pack: "400 g Tub",
    price: 35,
    category: "dairy",
    img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_paneer",
    name: "Fresh Malai Paneer",
    pack: "200 g Block",
    price: 90,
    category: "dairy",
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_butter",
    name: "Amul Butter (Salted)",
    pack: "100 g",
    price: 58,
    category: "dairy",
    img: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80",
    popular: false
  },

  // Veggies & Fruits
  {
    id: "g_onion",
    name: "Fresh Red Onions (Pyaaz)",
    pack: "1 kg",
    price: 38,
    category: "veggies",
    img: "https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_potato",
    name: "New Crop Fresh Potatoes (Aloo)",
    pack: "1 kg",
    price: 30,
    category: "veggies",
    img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_tomato",
    name: "Hybrid Ripe Tomatoes (Tamatar)",
    pack: "1 kg",
    price: 40,
    category: "veggies",
    img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_banana",
    name: "Robusta Fresh Bananas",
    pack: "1 Dozen (12 pcs)",
    price: 60,
    category: "veggies",
    img: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_lemon",
    name: "Fresh Juicy Lemons & Green Chillies",
    pack: "4 Lemons + 100g Mirchi",
    price: 25,
    category: "veggies",
    img: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?w=500&auto=format&fit=crop&q=80",
    popular: false
  },

  // Pantry & Staples
  {
    id: "g_atta",
    name: "Aashirvaad Shudh Chakki Atta",
    pack: "5 kg Bag",
    price: 245,
    category: "staples",
    img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_rice",
    name: "Fortune Everyday Basmati Rice",
    pack: "1 kg Pack",
    price: 95,
    category: "staples",
    img: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_dal",
    name: "Tata Sampann Toor / Arhar Dal",
    pack: "1 kg Pouch",
    price: 165,
    category: "staples",
    img: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_oil",
    name: "Fortune Sunlite Sunflower Oil",
    pack: "1 Litre Pouch",
    price: 135,
    category: "staples",
    img: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_maggi",
    name: "Maggi 2-Minute Masala Noodles",
    pack: "Pack of 4 (280g)",
    price: 56,
    category: "staples",
    img: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_sugar",
    name: "Madhur Pure & Hygienic Sugar",
    pack: "1 kg",
    price: 50,
    category: "staples",
    img: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=500&auto=format&fit=crop&q=80",
    popular: false
  },

  // Snacks & Beverages
  {
    id: "g_tea",
    name: "Tata Tea Gold Leaf Tea",
    pack: "250 g Box",
    price: 140,
    category: "snacks",
    img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80",
    popular: true
  },
  {
    id: "g_biscuits",
    name: "Parle-G Gold / Hide & Seek",
    pack: "200 g Pack",
    price: 30,
    category: "snacks",
    img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_chips",
    name: "Lay's India's Magic Masala Chips",
    pack: "50 g Pouch",
    price: 20,
    category: "snacks",
    img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_coke",
    name: "Coca-Cola Chilled Pet Bottle",
    pack: "750 ml Bottle",
    price: 40,
    category: "snacks",
    img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80",
    popular: false
  },

  // Household & Cleaning
  {
    id: "g_detergent",
    name: "Surf Excel Easy Wash Detergent",
    pack: "1 kg Pouch",
    price: 130,
    category: "household",
    img: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&auto=format&fit=crop&q=80",
    popular: false
  },
  {
    id: "g_vim",
    name: "Vim Dishwash Liquid Gel",
    pack: "500 ml Bottle",
    price: 105,
    category: "household",
    img: "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=500&auto=format&fit=crop&q=80",
    popular: false
  }
];

export const RESTAURANT_CATEGORIES = [
  { id: "all", label: "Full Menu", icon: "utensils" },
  { id: "breakfast", label: "Breakfast & Chai", icon: "coffee" },
  { id: "mains", label: "Mains & Curries", icon: "pot-food" },
  { id: "chinese", label: "Chinese & Starters", icon: "flame" },
  { id: "breads", label: "Breads & Rice", icon: "wheat" },
  { id: "beverages", label: "Beverages & Sweets", icon: "ice-cream" }
];

export const RESTAURANT_ITEMS = [
  // Breakfast & Quick Bites
  {
    id: "r_poha",
    name: "Indori Kanda Poha",
    desc: "Light flattened rice tempered with mustard, onions, roasted peanuts and fresh sev.",
    price: 70,
    category: "breakfast",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80",
    badge: "Bestseller"
  },
  {
    id: "r_idli",
    name: "Steamed Idli Sambar (3 Pcs)",
    desc: "Tender steamed rice cakes served with hot spicy lentil sambar and coconut chutney.",
    price: 80,
    category: "breakfast",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80",
    badge: "Healthy"
  },
  {
    id: "r_dosa",
    name: "Mysore Masala Dosa",
    desc: "Crispy golden crepe smeared with signature red garlic chutney and potato masala.",
    price: 120,
    category: "breakfast",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80",
    badge: "Popular"
  },
  {
    id: "r_paratha",
    name: "Amritsari Aloo Pyaaz Paratha (2 Pcs)",
    desc: "Whole wheat flatbreads stuffed with spiced potatoes, served with fresh curd and butter.",
    price: 110,
    category: "breakfast",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80",
    badge: "Filling"
  },
  {
    id: "r_sandwich",
    name: "Grilled Bombay Veg Cheese Sandwich",
    desc: "Double-layered sandwich loaded with cucumber, tomato, mint chutney, and molten cheese.",
    price: 95,
    category: "breakfast",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80",
    badge: "Kids Love"
  },

  // Lunch & Dinner Mains
  {
    id: "r_paneer_butter",
    name: "Paneer Butter Masala",
    desc: "Cubes of fresh cottage cheese simmered in a silky tomato, cashew, and butter gravy.",
    price: 220,
    category: "mains",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80",
    badge: "Chef Special"
  },
  {
    id: "r_dal_makhani",
    name: "Dhaba Style Dal Makhani",
    desc: "Slow-cooked black lentils simmered overnight with butter, cream, and gentle spices.",
    price: 180,
    category: "mains",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated"
  },
  {
    id: "r_dal_tadka",
    name: "Yellow Dal Tadka",
    desc: "Homestyle yellow toor dal tempered with desi ghee, cumin, garlic, and fresh green chillies.",
    price: 140,
    category: "mains",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_butter_chicken",
    name: "Murgh Butter Chicken",
    desc: "Tender tandoor chicken pieces simmered in rich velvety tomato gravy with kasuri methi.",
    price: 270,
    category: "mains",
    isVeg: false,
    img: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80",
    badge: "Signature"
  },
  {
    id: "r_kadai_chicken",
    name: "Kadai Chicken Masala",
    desc: "Juicy chicken cooked with crushed whole spices, capsicum, onions, and thick gravy.",
    price: 260,
    category: "mains",
    isVeg: false,
    img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80"
  },

  // Chinese & Starters
  {
    id: "r_veg_noodles",
    name: "Veg Hakka Noodles",
    desc: "Wok-tossed thin noodles with crunchy julienne vegetables, spring onion, and mild soy sauce.",
    price: 130,
    category: "chinese",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_manchurian",
    name: "Veg Manchurian Dry / Gravy",
    desc: "Crispy vegetable dumplings tossed in zesty ginger-garlic and scallion sauce.",
    price: 145,
    category: "chinese",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_chilli_paneer",
    name: "Crispy Chilli Paneer",
    desc: "Golden paneer cubes sauteed with bell peppers, green chillies, and hot garlic sauce.",
    price: 180,
    category: "chinese",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500&auto=format&fit=crop&q=80",
    badge: "Spicy"
  },

  // Breads & Rice
  {
    id: "r_butter_roti",
    name: "Butter Tandoori Roti",
    desc: "Crisp and soft whole wheat roti fresh from tandoor, brushed with butter.",
    price: 20,
    category: "breads",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_butter_naan",
    name: "Garlic Butter Naan",
    desc: "Leavened refined flour bread baked in tandoor with roasted garlic and coriander.",
    price: 45,
    category: "breads",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_jeera_rice",
    name: "Steamed Jeera Rice",
    desc: "Fragrant long-grain basmati rice tempered with roasted cumin seeds and desi ghee.",
    price: 110,
    category: "breads",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_veg_biryani",
    name: "Hyderabadi Veg Dum Biryani",
    desc: "Layered basmati rice with exotic vegetables, saffron, mint, and fried onions. Served with raita.",
    price: 190,
    category: "breads",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    badge: "Must Try"
  },
  {
    id: "r_chicken_biryani",
    name: "Royal Chicken Dum Biryani",
    desc: "Slow-cooked bone-in chicken marinated in yogurt and spices layered with fragrant saffron rice.",
    price: 250,
    category: "breads",
    isVeg: false,
    img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    badge: "Bestseller"
  },

  // Beverages & Sweets
  {
    id: "r_masala_chai",
    name: "Kulhad Masala Chai (Serves 2)",
    desc: "Freshly brewed milk tea infused with crushed ginger, cardamom, and aromatic spices.",
    price: 40,
    category: "beverages",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_cold_coffee",
    name: "Classic Frappe Cold Coffee",
    desc: "Chilled blended coffee with milk, chocolate drizzle, and rich ice cream froth.",
    price: 85,
    category: "beverages",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "r_gulab_jamun",
    name: "Hot Gulab Jamun (2 Pcs)",
    desc: "Soft fried milk dumplings soaked in rose and cardamom scented sugar syrup.",
    price: 60,
    category: "beverages",
    isVeg: true,
    img: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80"
  }
];
