const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');

// Load environment variables
dotenv.config();

const defaultImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";

const menuItems = [
  // --- Barbecue & Kebabs ---
  {
    name: "Afghan Mutton Tikka",
    description: "Traditional Afghani-style mutton tikka, skewered and charcoal-grilled.",
    price: 47,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Chopan Kabab",
    description: "Traditional Afghan mutton chops, marinated and charcoal-grilled.",
    price: 42,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Shinwari Kabab",
    description: "Authentic Shinwari style seasoned lamb kabab cooked over hot charcoals.",
    price: 44,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Shinwari Kabab (Portions)",
    description: "Large portions of authentic Shinwari charcoal lamb kabab.",
    price: 0,
    image: defaultImage,
    category: "Barbecue & Kebabs",
    hasVersions: true,
    versions: [
      { name: "1 KG", price: 125 },
      { name: "Half KG", price: 65 }
    ]
  },
  {
    name: "Mutton Shami Kabab",
    description: "Minced mutton patties blended with spices and lentils, shallow fried.",
    price: 37,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Kabab Brinjal",
    description: "Delicious combination of skewered meat kabab and grilled eggplant.",
    price: 41,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Special Kabuli Chicken Tikka Boti",
    description: "Spiced chicken breast chunks marinated in traditional Kabuli spices and grilled.",
    price: 42,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Chicken Charcoal White",
    description: "Chicken marinated in mild cream, yogurt, and spices, grilled over charcoal.",
    price: 0,
    image: defaultImage,
    category: "Barbecue & Kebabs",
    hasVersions: true,
    versions: [
      { name: "Full", price: 39 },
      { name: "Half", price: 25 }
    ]
  },
  {
    name: "Afghan Special Chicken Tikka",
    description: "Afghani style bone-in chicken tikka marinated with fresh herbs and spices.",
    price: 32,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Afghan Mix Kebab",
    description: "A platter of assorted classic Afghan chicken and mutton seekh kababs.",
    price: 43,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Chicken Charcoal",
    description: "Traditional charcoal grilled chicken skewers marinated in red spice blend.",
    price: 0,
    image: defaultImage,
    category: "Barbecue & Kebabs",
    hasVersions: true,
    versions: [
      { name: "Full", price: 39 },
      { name: "Half", price: 26 }
    ]
  },
  {
    name: "Afghan Special Chicken Grill Tikka (Spicy)",
    description: "Spicy skewered chicken tikka breast chunks grilled over open fire.",
    price: 33,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Afghan Special Grill Chicken Charcoal",
    description: "Whole chicken marinated in special house spices and grilled over charcoals.",
    price: 0,
    image: defaultImage,
    category: "Barbecue & Kebabs",
    hasVersions: true,
    versions: [
      { name: "Full", price: 43 },
      { name: "Half", price: 26 }
    ]
  },
  {
    name: "Chicken Malai Boti",
    description: "Tender boneless chicken pieces marinated in fresh cream, cheese, and mild spices.",
    price: 39,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Sultan Kebab",
    description: "Premium royal platter of tender mutton loin pieces, seekh kababs, and chicken.",
    price: 195,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Special Friend Kebab",
    description: "Platter designed for sharing, containing assorted mutton and chicken kebabs.",
    price: 113,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Afghan Special Chicken Grill Tikka (Regular)",
    description: "Mildly spiced chicken breast tikka chunks grilled over charcoal.",
    price: 26,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Afghan Special Mix Chicken Tikka",
    description: "A mixture of bone-in and boneless grilled chicken tikka portions.",
    price: 42,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Special Badami Kebab",
    description: "Succulent minced chicken/mutton kababs mixed with crushed almonds.",
    price: 25,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Special Chapli Kebab (Beef)",
    description: "Authentic shallow-fried ground beef patties mixed with green chilies, tomatoes, and dry spices.",
    price: 0,
    image: defaultImage,
    category: "Barbecue & Kebabs",
    hasVersions: true,
    versions: [
      { name: "Full", price: 28 },
      { name: "Half", price: 23 }
    ]
  },
  {
    name: "Special Chapli Kebab Mutton",
    description: "Shallow-fried ground mutton patty blended with fresh spices and pomegranate seeds.",
    price: 28,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },
  {
    name: "Special Degi Kebab",
    description: "Slow pot-cooked mutton kebabs in a rich, traditional aromatic thick gravy.",
    price: 37,
    image: defaultImage,
    category: "Barbecue & Kebabs"
  },

  // --- Platters & Combo Deals ---
  {
    name: "Mix Barbecue with Afghani Rice For Family Deal",
    description: "Huge family platter containing Kabuli pulao, seekh kebabs, chicken tikka, salad, and raita.",
    price: 199,
    image: defaultImage,
    category: "Platters & Combo Deals",
    isDeal: true
  },
  {
    name: "4 Person Mix Grill Rice",
    description: "Feast platter for four containing assorted grilled kebabs served on a bed of seasoned rice.",
    price: 169,
    image: defaultImage,
    category: "Platters & Combo Deals",
    isDeal: true
  },

  // --- Rice Dishes ---
  {
    name: "Afghani Pulao with Mutton",
    description: "Authentic steamed long-grain rice topped with sweet carrots, raisins, and tender mutton.",
    price: 35,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Afghani Pulao with Lamb Shank",
    description: "Aromatic pulao rice served with a slow-cooked, melt-in-mouth lamb shank.",
    price: 39,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Half Grill Chicken with Rice",
    description: "Half charcoal-grilled chicken served with a side of seasoned Afghani pulao rice.",
    price: 36,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Dum Pukht Chicken Biryani",
    description: "Slow clay-pot steamed biryani rice layer cooked with aromatic spices and tender chicken.",
    price: 39,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Dum Pukht Pulao",
    description: "Traditional slow dough-sealed steamed pulao rice with tender cuts of mutton.",
    price: 45,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Mutton Tikka with Pulao",
    description: "Skewered mutton tikka charcoal kababs served on a bed of hot pulao rice.",
    price: 47,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Shami Kebab with Pulao Rice",
    description: "Fried shami kebabs served over delicious seasoned pulao rice.",
    price: 39,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Chicken Tikka with Pulao Rice",
    description: "Grilled chicken tikka portions served with aromatic pulao rice.",
    price: 42,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Afghani Pulao with Lamb Shank (Feasts)",
    description: "Platter of lamb shank pulao for family sharing.",
    price: 0,
    image: defaultImage,
    category: "Rice Dishes",
    hasVersions: true,
    versions: [
      { name: "4 Person", price: 149 },
      { name: "2 Person", price: 79 }
    ]
  },
  {
    name: "Chapli Kebab with Afghani Pulao",
    description: "Traditional chapli kebab patties served on top of carrot-raisin pulao rice.",
    price: 36,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Mix Kebab with Rice",
    description: "Mixed skewers of chicken and beef kababs served on seasoned rice.",
    price: 50,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Mutton Biryani",
    description: "Spicy and aromatic basmati rice cooked with tender pieces of mutton.",
    price: 32,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Chicken Biryani",
    description: "Delicious seasoned basmati rice cooked with chicken in a yogurt-spice gravy.",
    price: 0,
    image: defaultImage,
    category: "Rice Dishes",
    hasVersions: true,
    versions: [
      { name: "Full", price: 22 },
      { name: "Half", price: 15 }
    ]
  },
  {
    name: "Special Mix Kebab Biryani",
    description: "A unique fusion of spicy biryani rice topped with assorted grilled kebabs.",
    price: 45,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Mutton Karahi Pulao Rice",
    description: "A combination of wok-fried mutton karahi served alongside pulao rice.",
    price: 55,
    image: defaultImage,
    category: "Rice Dishes"
  },
  {
    name: "Plain Afghani Pulao",
    description: "Steamed seasoned basmati rice topped with raisins and carrots.",
    price: 15,
    image: defaultImage,
    category: "Rice Dishes"
  },

  // --- Seafood ---
  {
    name: "Zaheer Shehiri Fish with Rice",
    description: "Traditional Shehiri spiced whole fish, grilled/fried and served with seasoned rice.",
    price: 44,
    image: defaultImage,
    category: "Fish & Seafood"
  },
  {
    name: "Zaheri Shehiri Fish",
    description: "Authentic Zaheri style fried fish seasoned with house special spices.",
    price: 39,
    image: defaultImage,
    category: "Fish & Seafood"
  },
  {
    name: "King Fish",
    description: "Premium King Fish steaks pan-fried with traditional spices.",
    price: 39,
    image: defaultImage,
    category: "Fish & Seafood"
  },
  {
    name: "Sea Bream Fish",
    description: "Fresh whole Sea Bream fish seasoned and grilled over open charcoal.",
    price: 39,
    image: defaultImage,
    category: "Fish & Seafood"
  },

  // --- Karahi & Curries ---
  {
    name: "Chicken Jalfrezi",
    description: "Stir-fried boneless chicken cooked in a thick sweet-sour gravy with bell peppers and tomatoes.",
    price: 36,
    image: defaultImage,
    category: "Karahi & Curries"
  },
  {
    name: "Chicken Ginger",
    description: "Boneless chicken chunks cooked in a creamy tomato sauce loaded with fresh ginger juliennes.",
    price: 35,
    image: defaultImage,
    category: "Karahi & Curries"
  },
  {
    name: "Special Shinwari Chicken Karahi",
    description: "Traditional Shinwari style chicken wok-fried with salt, tomatoes, and green chilies.",
    price: 0,
    image: defaultImage,
    category: "Karahi & Curries",
    hasVersions: true,
    versions: [
      { name: "Full", price: 75 },
      { name: "Half", price: 45 },
      { name: "Quarter", price: 21 },
      { name: "One Person", price: 31 }
    ]
  },
  {
    name: "Authentic Charsee Karahi Lamb",
    description: "Legendary Peshawar style lamb karahi cooked in lamb fat, tomatoes, salt, and green chilies.",
    price: 0,
    image: defaultImage,
    category: "Karahi & Curries",
    hasVersions: true,
    versions: [
      { name: "Full", price: 99 },
      { name: "Half", price: 59 },
      { name: "One Person", price: 35 }
    ]
  },
  {
    name: "Authentic Shinwari Karahi Lamb",
    description: "Traditional wok-cooked tender lamb chunks using minimal spices, fresh tomatoes, and butter.",
    price: 0,
    image: defaultImage,
    category: "Karahi & Curries",
    hasVersions: true,
    versions: [
      { name: "Full", price: 99 },
      { name: "Half", price: 59 },
      { name: "One Person", price: 35 }
    ]
  },
  {
    name: "Dum Pukht Special Mutton",
    description: "Tender lamb pieces slow pot-steamed under dough seal with potatoes and whole spices.",
    price: 0,
    image: defaultImage,
    category: "Karahi & Curries",
    hasVersions: true,
    versions: [
      { name: "Large", price: 139 },
      { name: "Small", price: 99 }
    ]
  },
  {
    name: "Rosh Kandhari (Dum Pukht)",
    description: "Traditional Kandhari style mutton cooked in its own fat and juices with minimal seasoning.",
    price: 35,
    image: defaultImage,
    category: "Karahi & Curries"
  },
  {
    name: "Dum Pukht Vegetable with Mutton",
    description: "Slow pot-cooked mutton pieces steamed together with fresh root vegetables.",
    price: 0,
    image: defaultImage,
    category: "Karahi & Curries",
    hasVersions: true,
    versions: [
      { name: "Large", price: 105 },
      { name: "Small", price: 65 }
    ]
  },
  {
    name: "Do Pyaza",
    description: "Tender mutton cooked in a thick gravy containing lots of fresh and caramelized onions.",
    price: 43,
    image: defaultImage,
    category: "Karahi & Curries"
  },
  {
    name: "Mutton Namkeen",
    description: "Traditional salted mutton chunks cooked in a light broth with ginger and garlic.",
    price: 33,
    image: defaultImage,
    category: "Karahi & Curries"
  },
  {
    name: "Mutton Korma",
    description: "Rich, creamy mutton curry cooked in a yogurt-based onion gravy with traditional spices.",
    price: 0,
    image: defaultImage,
    category: "Karahi & Curries",
    hasVersions: true,
    versions: [
      { name: "Full", price: 30 },
      { name: "Half", price: 18 }
    ]
  },

  // --- Fast Food & Snacks ---
  {
    name: "Special Afghani Burger",
    description: "Traditional street style burger wrapped in flatbread containing fries, boiled eggs, and chicken.",
    price: 20,
    image: defaultImage,
    category: "Fast Food & Snacks"
  },
  {
    name: "Roll Kebab Sandwich",
    description: "Minced beef/chicken seekh kabab wrapped in hot flatbread with fresh salad and chutney.",
    price: 17,
    image: defaultImage,
    category: "Fast Food & Snacks"
  },
  {
    name: "Afghani Mantu",
    description: "Traditional steamed beef dumplings topped with yogurt sauce and split pea gravy.",
    price: 28,
    image: defaultImage,
    category: "Fast Food & Snacks"
  },

  // --- Salads & Soups ---
  {
    name: "Green Salad",
    description: "Freshly sliced cucumbers, tomatoes, carrots, lettuce, and lemon juice.",
    price: 19,
    image: defaultImage,
    category: "Salads & Soups"
  },
  {
    name: "Fattoush",
    description: "Levantine salad made from toasted or fried pieces of khubz combined with mixed greens.",
    price: 19,
    image: defaultImage,
    category: "Salads & Soups"
  },
  {
    name: "Special Afghani Salad",
    description: "Finely diced onions, cucumbers, and tomatoes with fresh mint leaves and lemon juice.",
    price: 16,
    image: defaultImage,
    category: "Salads & Soups"
  },
  {
    name: "Special Avocado Salad",
    description: "Creamy avocado slices served on a bed of fresh mixed greens with citrus dressing.",
    price: 35,
    image: defaultImage,
    category: "Salads & Soups"
  },
  {
    name: "Mutina Salad",
    description: "Special fresh mint and diced vegetables salad tossed in extra virgin olive oil.",
    price: 16,
    image: defaultImage,
    category: "Salads & Soups"
  },
  {
    name: "Fruit Special Salad",
    description: "Seasonal cut fruits mixed in a sweet cream and honey dressing.",
    price: 25,
    image: defaultImage,
    category: "Salads & Soups"
  },

  // --- Breakfast & Pulses ---
  {
    name: "Egg Omelette",
    description: "Traditional pan-fried eggs beaten with chopped onions, tomatoes, and green chilies.",
    price: 0,
    image: defaultImage,
    category: "Breakfast & Pulses",
    hasVersions: true,
    versions: [
      { name: "Full", price: 8 },
      { name: "Half", price: 4 }
    ]
  },
  {
    name: "Fresh Keema",
    description: "Spicy pan-fried minced beef or mutton cooked with tomatoes, ginger, and green chilies.",
    price: 0,
    image: defaultImage,
    category: "Breakfast & Pulses",
    hasVersions: true,
    versions: [
      { name: "Full", price: 15 },
      { name: "Half", price: 8 }
    ]
  },
  {
    name: "Chana Masala",
    description: "Spiced chickpeas cooked in a tomato-onion based gravy with green chilies.",
    price: 0,
    image: defaultImage,
    category: "Breakfast & Pulses",
    hasVersions: true,
    versions: [
      { name: "Full", price: 12 },
      { name: "Half", price: 6 }
    ]
  },
  {
    name: "Dal Mash",
    description: "Wok-fried creamy white split lentils seasoned with fried garlic and dry spices.",
    price: 0,
    image: defaultImage,
    category: "Breakfast & Pulses",
    hasVersions: true,
    versions: [
      { name: "Full", price: 12 },
      { name: "Half", price: 6 }
    ]
  },
  {
    name: "Nihari",
    description: "Slow-cooked beef shank stew cooked overnight in rich flour-based spicy gravy.",
    price: 0,
    image: defaultImage,
    category: "Breakfast & Pulses",
    hasVersions: true,
    versions: [
      { name: "Full", price: 18 },
      { name: "Half", price: 10 }
    ]
  },
  {
    name: "Dal",
    description: "Traditional yellow split lentils cooked and seasoned with fried garlic oil.",
    price: 10,
    image: defaultImage,
    category: "Breakfast & Pulses"
  },
  {
    name: "Aloo Palak",
    description: "Potato chunks cooked with fresh chopped spinach leaves in mild spices.",
    price: 10,
    image: defaultImage,
    category: "Breakfast & Pulses"
  },
  {
    name: "Mix Sabzi",
    description: "Stir-fried seasonal vegetables cooked in a dry tomato-onion gravy.",
    price: 12,
    image: defaultImage,
    category: "Breakfast & Pulses"
  },
  {
    name: "Mutton Paya",
    description: "Slow cooked mutton trotters cooked in a rich, watery soup loaded with herbs.",
    price: 18,
    image: defaultImage,
    category: "Breakfast & Pulses"
  },
  {
    name: "Lobia",
    description: "White black-eyed kidney beans cooked in a spiced tomato onion gravy.",
    price: 10,
    image: defaultImage,
    category: "Breakfast & Pulses"
  },
  {
    name: "Borani Banjan",
    description: "Traditional Afghan eggplant dish baked with garlic yogurt and tomato sauce.",
    price: 20,
    image: defaultImage,
    category: "Breakfast & Pulses"
  },

  // --- Beverages & Desserts ---
  {
    name: "Afghani Yogurt",
    description: "Creamy, thick homemade yogurt blended with fresh herbs and mint.",
    price: 15,
    image: defaultImage,
    category: "Beverages & Desserts"
  },
  {
    name: "Afghani Lassi",
    description: "Traditional yogurt based drink, served sweet or salty with hints of mint.",
    price: 10,
    image: defaultImage,
    category: "Beverages & Desserts"
  },
  {
    name: "Special Green Tea (Qahwa)",
    description: "Authentic cardamom scented green tea, served hot.",
    price: 10,
    image: defaultImage,
    category: "Beverages & Desserts"
  },
  {
    name: "Afghani Kheer",
    description: "Sweet rice pudding boiled in milk with cardamom and topped with almonds.",
    price: 6,
    image: defaultImage,
    category: "Beverages & Desserts"
  },
  {
    name: "Kanafa",
    description: "Traditional Middle Eastern dessert made with thin noodle-like pastry soaked in sweet syrup.",
    price: 15,
    image: defaultImage,
    category: "Beverages & Desserts"
  },

  // --- Breads (Naan) ---
  {
    name: "Butter Naan",
    description: "Freshly baked flatbread topped with melted butter.",
    price: 5,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Kalonji Naan",
    description: "Freshly baked clay-oven flatbread topped with black caraway seeds.",
    price: 5,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Garlic Naan",
    description: "Freshly baked flatbread loaded with minced garlic and butter.",
    price: 5,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Roghni Naan",
    description: "Thick round sesame seeded naan prepared with milk and oil.",
    price: 5,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Normal Bread (Tandoori Roti)",
    description: "Simple wheat flatbread baked inside the clay oven.",
    price: 5,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Paratha",
    description: "Pan-fried layered crispy flatbread.",
    price: 5,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Cheese Naan",
    description: "Tandoori flatbread stuffed with mozzarella cheese.",
    price: 7,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Cheese Zaatar",
    description: "Flatbread topped with melted cheese and aromatic wild thyme (Zaatar).",
    price: 7,
    image: defaultImage,
    category: "Breads"
  },
  {
    name: "Cheese Chips Mix Naan",
    description: "Flatbread stuffed with a mix of cheese and crushed potato chips.",
    price: 7,
    image: defaultImage,
    category: "Breads"
  },

  // --- Feasts (Special Orders) ---
  {
    name: "Farah Sajji Whole Lamb",
    description: "A complete whole lamb slow charcoal-roasted in traditional Sajji style. Requires pre-order.",
    price: 600,
    image: defaultImage,
    category: "Special Feasts"
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database Connected successfully!");

    console.log("Cleaning MenuItem collection...");
    await MenuItem.deleteMany({});
    console.log("Collection cleaned.");

    console.log(`Inserting ${menuItems.length} menu items...`);
    await MenuItem.insertMany(menuItems);
    console.log("Database seeded successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedDB();
