import { Trip } from '../../models/trip.model';

export const MOCK_TRIPS: Trip[] = [
  {
    _id: '1',
    title: 'Cairo Historical Tour',
    destination: 'Cairo, Egypt',
    imageUrl: 'https://images.unsplash.com/photo-1542401886-65d27afda266?w=400&h=300&fit=crop',
    duration: 5,
    budget: 'mid-range',
    travelers: 2,
    interests: ['history', 'culture', 'sightseeing'],
    summary: 'Explore the ancient wonders of Cairo with professional guides and comfortable accommodations.',
    estimatedTotalCost: 3500,
    currency: 'EGP',
    language: 'en',
    status: 'saved',
    isAIGenerated: true,
    createdAt: '2024-06-10T10:00:00Z',
    updatedAt: '2024-06-10T10:00:00Z',
    days: [
      {
        day: 1,
        title: 'Arrival & Giza Pyramids',
        activities: ['Arrival at Cairo International Airport', 'Visit Great Pyramids of Giza', 'Explore Sphinx'],
        meals: ['Dinner at local restaurant'],
        accommodation: 'Marriott Cairo',
        tips: 'Book tickets online to skip queues',
        estimatedCost: 700
      },
      {
        day: 2,
        title: 'Egyptian Museum & Khan El-Khalili',
        activities: ['Egyptian Museum tour', 'Khan El-Khalili bazaar shopping', 'Sunset Nile River cruise'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Marriott Cairo',
        tips: 'Wear comfortable shoes for bazaar',
        estimatedCost: 650
      },
      {
        day: 3,
        title: 'Saqqara & Memphis',
        activities: ['Day trip to Saqqara Step Pyramid', 'Memphis open-air museum', 'Alabaster Sphinx'],
        meals: ['Breakfast', 'Lunch'],
        accommodation: 'Marriott Cairo',
        tips: 'Bring sun protection and water',
        estimatedCost: 800
      },
      {
        day: 4,
        title: 'Islamic Cairo & Citadel',
        activities: ['Mohamed Ali Mosque', 'Islamic Cairo walking tour', 'Local market exploration'],
        meals: ['Breakfast', 'Lunch at traditional restaurant', 'Dinner'],
        accommodation: 'Marriott Cairo',
        tips: 'Dress respectfully for religious sites',
        estimatedCost: 600
      },
      {
        day: 5,
        title: 'Leisure & Departure',
        activities: ['Optional shopping', 'Spa time', 'Departure'],
        meals: ['Breakfast', 'Lunch'],
        accommodation: null,
        tips: 'Check out early for afternoon flights',
        estimatedCost: 750
      }
    ]
  },
  {
    _id: '2',
    title: 'Red Sea Beach Luxury Getaway',
    destination: 'Hurghada, Egypt',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    duration: 4,
    budget: 'luxury',
    travelers: 4,
    interests: ['beach', 'diving', 'relaxation', 'water sports'],
    summary: 'Luxury beach resort experience with world-class diving and water activities.',
    estimatedTotalCost: 8500,
    currency: 'EGP',
    language: 'en',
    status: 'saved',
    isAIGenerated: true,
    createdAt: '2024-06-08T14:30:00Z',
    updatedAt: '2024-06-08T14:30:00Z',
    days: [
      {
        day: 1,
        title: 'Arrival & Resort Check-in',
        activities: ['Fly to Hurghada', 'Resort check-in', 'Beach relaxation', 'Welcome dinner'],
        meals: ['Dinner'],
        accommodation: '5-star Luxury Resort',
        tips: 'Direct flights from Cairo available',
        estimatedCost: 2000
      },
      {
        day: 2,
        title: 'Scuba Diving & Water Activities',
        activities: ['Scuba certification course', 'Coral reef diving', 'Submarine tour'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: '5-star Luxury Resort',
        tips: 'Book diving ahead for best rates',
        estimatedCost: 2200
      },
      {
        day: 3,
        title: 'Island Hopping & Snorkeling',
        activities: ['Giftun Island trip', 'Snorkeling in crystal waters', 'Beach picnic'],
        meals: ['Breakfast', 'Island lunch', 'Dinner'],
        accommodation: '5-star Luxury Resort',
        tips: 'Bring waterproof camera',
        estimatedCost: 1800
      },
      {
        day: 4,
        title: 'Spa & Departure',
        activities: ['Spa treatments', 'Shopping at Marina', 'Departure'],
        meals: ['Breakfast', 'Lunch'],
        accommodation: null,
        tips: 'Leave time for airport transfer',
        estimatedCost: 2500
      }
    ]
  },
  {
    _id: '3',
    title: 'Nile Cruise Adventure',
    destination: 'Luxor to Aswan, Egypt',
    imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
    duration: 6,
    budget: 'mid-range',
    travelers: 2,
    interests: ['history', 'luxury', 'cruise', 'culture'],
    summary: 'Luxury Nile River cruise with visits to Luxor temples, Karnak, and Aswan.',
    estimatedTotalCost: 5200,
    currency: 'EGP',
    language: 'ar',
    status: 'saved',
    isAIGenerated: false,
    createdAt: '2024-06-05T09:15:00Z',
    updatedAt: '2024-06-05T09:15:00Z',
    days: [
      {
        day: 1,
        title: 'Arrival in Luxor',
        activities: ['Arrive in Luxor', 'Check-in on cruise ship', 'Luxor Temple visit'],
        meals: ['Dinner'],
        accommodation: 'Nile Cruise Ship (Luxury)',
        tips: 'Book direct flights from Cairo',
        estimatedCost: 900
      },
      {
        day: 2,
        title: 'Karnak & Valley of the Kings',
        activities: ['Karnak Temple complex tour', 'Valley of the Kings exploration', 'Tutankhamun tomb'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Nile Cruise Ship (Luxury)',
        tips: 'Early start recommended for cool temperatures',
        estimatedCost: 950
      },
      {
        day: 3,
        title: 'Temple of Hatshepsut & Colossi',
        activities: ['Temple of Hatshepsut', 'Colossi of Memnon', 'West Bank exploration'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Nile Cruise Ship (Luxury)',
        tips: 'Wear sunscreen and hats',
        estimatedCost: 850
      },
      {
        day: 4,
        title: 'Edfu & Cruising South',
        activities: ['Temple of Edfu visit', 'River sailing', 'Deck entertainment'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Nile Cruise Ship (Luxury)',
        tips: 'Relax on deck in evening',
        estimatedCost: 750
      },
      {
        day: 5,
        title: 'Kom Ombo & Aswan',
        activities: ['Temple of Kom Ombo', 'Arrive in Aswan', 'Philae Temple visit'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Nile Cruise Ship (Luxury)',
        tips: 'Don\'t miss Aswan high dam',
        estimatedCost: 950
      },
      {
        day: 6,
        title: 'Aswan & Departure',
        activities: ['Aswan market visit', 'Nubian village tour', 'Departure'],
        meals: ['Breakfast', 'Lunch'],
        accommodation: null,
        tips: 'Early morning flights available',
        estimatedCost: 800
      }
    ]
  },
  {
    _id: '4',
    title: 'Budget Egypt Explorer',
    destination: 'Multi-city Egypt',
    imageUrl: 'https://images.unsplash.com/photo-1531512073830-ba890dd48bc2?w=400&h=300&fit=crop',
    duration: 7,
    budget: 'budget',
    travelers: 1,
    interests: ['budget travel', 'backpacking', 'culture'],
    summary: 'Budget-friendly tour covering major Egyptian attractions for solo travelers.',
    estimatedTotalCost: 1800,
    currency: 'EGP',
    language: 'en',
    status: 'draft',
    isAIGenerated: true,
    createdAt: '2024-06-03T16:45:00Z',
    updatedAt: '2024-06-03T16:45:00Z',
    days: [
      {
        day: 1,
        title: 'Cairo Budget Hotels',
        activities: ['Budget accommodation check-in', 'Khan El-Khalili bazaar', 'Local food tour'],
        meals: ['Lunch', 'Dinner at local eatery'],
        accommodation: 'Budget Hostel',
        tips: 'Stay in Downtown Cairo for convenience',
        estimatedCost: 250
      },
      {
        day: 2,
        title: 'Cairo Attractions',
        activities: ['Pyramids of Giza', 'Sphinx photo op', 'Local bus transportation'],
        meals: ['Breakfast', 'Lunch', 'Street food dinner'],
        accommodation: 'Budget Hostel',
        tips: 'Use public transportation to save costs',
        estimatedCost: 280
      },
      {
        day: 3,
        title: 'Cairo Museums & Markets',
        activities: ['Egyptian Museum', 'Islamic Cairo walk', 'Ramses Train Station'],
        meals: ['Breakfast', 'Lunch', 'Koshari dinner'],
        accommodation: 'Budget Hostel',
        tips: 'Student discounts may apply',
        estimatedCost: 200
      },
      {
        day: 4,
        title: 'Travel to Luxor',
        activities: ['Train journey to Luxor', 'Budget hotel check-in', 'Evening walk'],
        meals: ['Train meals', 'Dinner'],
        accommodation: 'Budget Hotel Luxor',
        tips: 'Overnight train is cheaper than flights',
        estimatedCost: 300
      },
      {
        day: 5,
        title: 'Luxor Sights',
        activities: ['Karnak Temple', 'Luxor Temple', 'Local guide tour'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Budget Hotel Luxor',
        tips: 'Hire local guide for better rates',
        estimatedCost: 270
      },
      {
        day: 6,
        title: 'Valley of Kings Budget Tour',
        activities: ['Valley of the Kings', 'West Bank exploration', 'Local restaurants'],
        meals: ['Breakfast', 'Lunch', 'Dinner'],
        accommodation: 'Budget Hotel Luxor',
        tips: 'Group tours offer discounts',
        estimatedCost: 300
      },
      {
        day: 7,
        title: 'Return to Cairo',
        activities: ['Bus to Cairo', 'Final shopping', 'Departure'],
        meals: ['Breakfast', 'Lunch', 'Airport meal'],
        accommodation: null,
        tips: 'Book return flight in advance',
        estimatedCost: 200
      }
    ]
  }
];

export const MOCK_TRIP_BY_ID: Record<string, Trip> = {
  '1': MOCK_TRIPS[0],
  '2': MOCK_TRIPS[1],
  '3': MOCK_TRIPS[2],
  '4': MOCK_TRIPS[3]
};
