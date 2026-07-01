const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Equipment = require('./models/Equipment');
const User = require('./models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/epm';

const workingUrls = {
  tomatoes: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
  carrots: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
  apples: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
  bananas: 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?auto=format&fit=crop&w=800&q=80',
  oil: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80',
  ghee: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
  murukku: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?auto=format&fit=crop&w=800&q=80',
  pickle: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80',
  jaggery: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80',
  seeds: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
  medicine: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?auto=format&fit=crop&w=800&q=80',
  fertilizer: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=800&q=80',
  tractor: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80',
  harvester: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=800&q=80',
  pump: 'https://images.unsplash.com/photo-1495908333425-29a1e0918c5f?auto=format&fit=crop&w=800&q=80'
};

const seedProducts = [
  {
    name: 'Fresh Organic Tomatoes',
    description: 'Freshly harvested organic tomatoes from our village farm. Grown without any chemical pesticides.',
    category: 'Organic Vegetables',
    price: 45,
    stock: 50,
    images: [workingUrls.tomatoes],
    villageName: 'Rampur',
    status: 'approved',
    rating: 4.8,
    reviewCount: 12,
    unit: 'kg',
    tags: ['organic', 'vegetable', 'tomato', 'fresh']
  },
  {
    name: 'Farm Fresh Carrots',
    description: 'Crunchy, sweet, and vibrant carrots naturally grown in fertile soil.',
    category: 'Organic Vegetables',
    price: 35,
    stock: 40,
    images: [workingUrls.carrots],
    villageName: 'Salem',
    status: 'approved',
    rating: 4.5,
    reviewCount: 15,
    unit: 'kg',
    tags: ['carrot', 'organic', 'vegetable']
  },
  {
    name: 'Farm Fresh Apples',
    description: 'Juicy, sweet, and crunchy apples picked straight from the orchards.',
    category: 'Fruits',
    price: 180,
    stock: 40,
    images: [workingUrls.apples],
    villageName: 'Shimla',
    status: 'approved',
    rating: 4.9,
    reviewCount: 20,
    unit: 'kg',
    tags: ['apple', 'fruit', 'fresh', 'sweet']
  },
  {
    name: 'Organic Bananas',
    description: 'Naturally ripened bananas, rich in potassium and completely organic.',
    category: 'Fruits',
    price: 60,
    stock: 100,
    images: [workingUrls.bananas],
    villageName: 'Theni',
    status: 'approved',
    rating: 4.6,
    reviewCount: 30,
    unit: 'dozen',
    tags: ['banana', 'fruit', 'organic']
  },
  {
    name: 'Cold Pressed Groundnut Oil',
    description: 'Pure cold-pressed groundnut oil, extracted using traditional wooden ghani.',
    category: 'Homemade Foods',
    price: 280,
    stock: 25,
    images: [workingUrls.oil],
    villageName: 'Erode',
    status: 'approved',
    rating: 4.8,
    reviewCount: 55,
    unit: '1L',
    tags: ['oil', 'groundnut', 'cold-pressed', 'cooking']
  },
  {
    name: 'Homemade Pure Ghee',
    description: 'Authentic cow ghee prepared using traditional bilona method.',
    category: 'Homemade Foods',
    price: 850,
    stock: 15,
    images: [workingUrls.ghee],
    villageName: 'Coimbatore',
    status: 'approved',
    rating: 5.0,
    reviewCount: 42,
    unit: '1L',
    tags: ['ghee', 'dairy', 'pure', 'cooking']
  },
  {
    name: 'Traditional Murukku',
    description: 'Crispy and delicious traditional homemade murukku snack prepared with quality ingredients.',
    category: 'Traditional Snacks',
    price: 120,
    stock: 40,
    images: [workingUrls.murukku],
    villageName: 'Karaikudi',
    status: 'approved',
    rating: 4.7,
    reviewCount: 42,
    unit: '500g',
    tags: ['snack', 'murukku', 'traditional', 'crispy']
  },
  {
    name: 'Peanut Chikki',
    description: 'Healthy and sweet peanut chikki made with pure jaggery and roasted peanuts.',
    category: 'Traditional Snacks',
    price: 80,
    stock: 60,
    images: [workingUrls.jaggery], // Jaggery works nicely for sweets
    villageName: 'Kovilpatti',
    status: 'approved',
    rating: 4.9,
    reviewCount: 35,
    unit: '500g',
    tags: ['snack', 'chikki', 'sweet', 'peanut']
  },
  {
    name: 'Spicy Mango Pickle',
    description: 'Traditional homemade spicy mango pickle prepared using authentic village recipes.',
    category: 'Pickles',
    price: 150,
    stock: 30,
    images: [workingUrls.pickle],
    villageName: 'Guntur',
    status: 'approved',
    rating: 4.6,
    reviewCount: 25,
    unit: '500g',
    tags: ['pickle', 'mango', 'spicy', 'homemade']
  },
  {
    name: 'Garlic Pickle',
    description: 'Tangy and spicy garlic pickle made with natural spices and mustard oil.',
    category: 'Pickles',
    price: 180,
    stock: 20,
    images: [workingUrls.pickle],
    villageName: 'Madurai',
    status: 'approved',
    rating: 4.7,
    reviewCount: 18,
    unit: '500g',
    tags: ['pickle', 'garlic', 'spicy', 'tangy']
  },
  {
    name: 'Pure Wild Honey',
    description: '100% natural and pure wild honey collected by local tribal gatherers from the deep forests.',
    category: 'Honey',
    price: 450,
    stock: 20,
    images: [workingUrls.ghee], // Honey/ghee have similar color profile
    villageName: 'Nilgiris',
    status: 'approved',
    rating: 5.0,
    reviewCount: 34,
    unit: '1kg',
    tags: ['honey', 'pure', 'natural', 'sweet']
  },
  {
    name: 'Forest Honey with Comb',
    description: 'Raw, unfiltered forest honey complete with the honeycomb.',
    category: 'Honey',
    price: 550,
    stock: 10,
    images: [workingUrls.oil], // Golden liquid
    villageName: 'Kodaikanal',
    status: 'approved',
    rating: 4.9,
    reviewCount: 22,
    unit: '500g',
    tags: ['honey', 'comb', 'raw', 'premium']
  },
  {
    name: 'Organic Pearl Millet (Bajra)',
    description: 'High-quality organic pearl millet, unpolished and rich in nutrients. Direct from farmers.',
    category: 'Millets',
    price: 60,
    stock: 100,
    images: [workingUrls.jaggery], // Grains representation
    villageName: 'Dharmapuri',
    status: 'approved',
    rating: 4.5,
    reviewCount: 18,
    unit: '1kg',
    tags: ['millet', 'bajra', 'organic', 'healthy']
  },
  {
    name: 'Finger Millet (Ragi)',
    description: 'Nutrient-dense finger millet, perfect for porridge or making healthy rotis.',
    category: 'Millets',
    price: 50,
    stock: 80,
    images: [workingUrls.murukku], // Grains representation
    villageName: 'Krishnagiri',
    status: 'approved',
    rating: 4.8,
    reviewCount: 29,
    unit: '1kg',
    tags: ['millet', 'ragi', 'healthy', 'grains']
  },
  {
    name: 'Handwoven Bamboo Basket',
    description: 'Beautiful and sturdy handwoven bamboo basket made by skilled village artisans.',
    category: 'Handicrafts',
    price: 250,
    stock: 15,
    images: [workingUrls.jaggery], // Earthy tones
    villageName: 'Palakkad',
    status: 'approved',
    rating: 4.9,
    reviewCount: 8,
    unit: 'piece',
    tags: ['handicraft', 'bamboo', 'basket', 'artisan']
  },
  {
    name: 'Terracotta Clay Pot',
    description: 'Traditional earthen pot perfect for cooking curries or storing water.',
    category: 'Handicrafts',
    price: 350,
    stock: 25,
    images: [workingUrls.pickle], // Earthy colors
    villageName: 'Manamadurai',
    status: 'approved',
    rating: 4.7,
    reviewCount: 19,
    unit: 'piece',
    tags: ['handicraft', 'clay', 'pot', 'traditional']
  },
  {
    name: 'Palm Jaggery (Karupatti)',
    description: 'Authentic and unrefined palm jaggery, an excellent healthy alternative to sugar.',
    category: 'Village Special Products',
    price: 300,
    stock: 50,
    images: [workingUrls.jaggery],
    villageName: 'Thoothukudi',
    status: 'approved',
    rating: 5.0,
    reviewCount: 60,
    unit: '1kg',
    tags: ['jaggery', 'sweet', 'healthy', 'special']
  },
  {
    name: 'Hand-pounded Rice',
    description: 'Nutritious hand-pounded traditional rice varieties retaining natural bran.',
    category: 'Village Special Products',
    price: 120,
    stock: 40,
    images: [workingUrls.murukku],
    villageName: 'Thanjavur',
    status: 'approved',
    rating: 4.8,
    reviewCount: 24,
    unit: '1kg',
    tags: ['rice', 'traditional', 'hand-pounded', 'grain']
  },
  {
    name: 'Organic Tomato Seeds',
    description: 'High-yielding organic tomato seeds suitable for home gardens and farming.',
    category: 'Seeds',
    price: 50,
    stock: 100,
    images: [workingUrls.seeds],
    villageName: 'Rampur',
    status: 'approved',
    rating: 4.6,
    reviewCount: 10,
    unit: 'pack',
    tags: ['seeds', 'tomato', 'farming', 'garden']
  },
  {
    name: 'Ayurvedic Herbal Cough Syrup',
    description: 'Natural cough remedy made from tulsi, honey, and ginger following traditional practices.',
    category: 'Medicine',
    price: 120,
    stock: 50,
    images: [workingUrls.medicine],
    villageName: 'Kerala',
    status: 'approved',
    rating: 4.9,
    reviewCount: 45,
    unit: 'bottle',
    tags: ['medicine', 'ayurvedic', 'cough', 'herbal']
  },
  {
    name: 'Organic Vermicompost',
    description: '100% natural and organic vermicompost fertilizer for all types of plants.',
    category: 'Fertilizer',
    price: 30,
    stock: 200,
    images: [workingUrls.fertilizer],
    villageName: 'Erode',
    status: 'approved',
    rating: 4.8,
    reviewCount: 32,
    unit: '1kg',
    tags: ['fertilizer', 'organic', 'compost', 'farming']
  }
];

const seedEquipment = [
  {
    name: 'Mahindra 575 DI Tractor',
    category: 'Tractor',
    description: '45 HP Tractor in excellent condition, ideal for plowing and cultivation.',
    pricePerHour: 500,
    pricePerDay: 4000,
    images: [workingUrls.tractor],
    village: 'Rampur',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    status: 'approved',
    isAvailable: true,
    views: 120,
    totalRentals: 15,
    contactPhone: '9876543210'
  },
  {
    name: 'Heavy Duty Harvester',
    category: 'Harvester',
    description: 'Reliable harvester for paddy and wheat crops. Comes with an experienced operator.',
    pricePerHour: 1500,
    pricePerDay: 12000,
    images: [workingUrls.harvester],
    village: 'Salem',
    district: 'Salem',
    state: 'Tamil Nadu',
    status: 'approved',
    isAvailable: true,
    views: 340,
    totalRentals: 8,
    contactPhone: '9876543211'
  },
  {
    name: '5HP Water Pump',
    category: 'Water Pump',
    description: 'Diesel water pump for irrigation. Easy to transport and operate.',
    pricePerHour: 100,
    pricePerDay: 700,
    images: [workingUrls.pump],
    village: 'Erode',
    district: 'Erode',
    state: 'Tamil Nadu',
    status: 'approved',
    isAvailable: true,
    views: 50,
    totalRentals: 25,
    contactPhone: '9876543212'
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');

    let seller = await User.findOne({ email: 'admin@epm.com' });
    
    if (!seller) {
      seller = await User.create({
        name: 'EPM Admin Seller',
        email: 'admin@epm.com',
        password: 'Admin@123',
        role: 'admin'
      });
    }

    await Product.deleteMany({});
    console.log('🧹 Cleared existing products');

    const productsWithSeller = seedProducts.map(product => ({
      ...product,
      sellerId: seller._id,
      sellerName: seller.name
    }));

    await Product.insertMany(productsWithSeller);
    console.log(`🌱 Successfully seeded ${productsWithSeller.length} products using ONLY verified Unsplash URLs!`);

    await Equipment.deleteMany({});
    console.log('🧹 Cleared existing equipment');

    const equipmentWithSeller = seedEquipment.map(eq => ({
      ...eq,
      seller: seller._id
    }));

    await Equipment.insertMany(equipmentWithSeller);
    console.log(`🚜 Successfully seeded ${equipmentWithSeller.length} equipment units!`);

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
