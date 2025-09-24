// constants/serviceSkills.js
// Predefined service categories and skills for technician specializations

export const SERVICE_CATEGORIES = {
  ELECTRICAL: {
    name: 'Electrical',
    icon: 'fas fa-bolt',
    description: 'Electrical installations, repairs, and maintenance',
    skills: [
      'electrical wiring',
      'electrical repair',
      'switch and socket installation',
      'ceiling fan installation',
      'lighting installation',
      'electrical troubleshooting',
      'circuit breaker repair',
      'electrical panel upgrade',
      'outdoor lighting',
      'electrical safety inspection'
    ]
  },
  
  PLUMBING: {
    name: 'Plumbing',
    icon: 'fas fa-wrench',
    description: 'Plumbing installations, repairs, and maintenance',
    skills: [
      'pipe repair',
      'drain cleaning',
      'faucet installation',
      'toilet repair',
      'water heater repair',
      'bathroom fitting',
      'kitchen plumbing',
      'pipe installation',
      'leak detection',
      'sewer line repair',
      'water pressure issues',
      'plumbing maintenance'
    ]
  },

  AC_HVAC: {
    name: 'AC & HVAC',
    icon: 'fas fa-snowflake',
    description: 'Air conditioning and heating system services',
    skills: [
      'ac repair',
      'ac installation',
      'ac maintenance',
      'hvac repair',
      'refrigerator repair',
      'air conditioner cleaning',
      'ac gas refilling',
      'central air conditioning',
      'split ac service',
      'window ac repair',
      'heat pump repair',
      'thermostat installation'
    ]
  },

  CARPENTRY: {
    name: 'Carpentry',
    icon: 'fas fa-hammer',
    description: 'Wood work, furniture assembly, and carpentry services',
    skills: [
      'furniture assembly',
      'door installation',
      'window installation',
      'cabinet installation',
      'shelving installation',
      'flooring installation',
      'custom furniture',
      'wood repair',
      'deck construction',
      'trim installation',
      'furniture repair',
      'wooden framework'
    ]
  },

  PAINTING: {
    name: 'Painting',
    icon: 'fas fa-paint-brush',
    description: 'Interior and exterior painting services',
    skills: [
      'interior painting',
      'exterior painting',
      'wall painting',
      'ceiling painting',
      'furniture painting',
      'texture painting',
      'spray painting',
      'wallpaper installation',
      'wall preparation',
      'color consultation',
      'decorative painting',
      'paint removal'
    ]
  },

  APPLIANCE_REPAIR: {
    name: 'Appliance Repair',
    icon: 'fas fa-tools',
    description: 'Home appliance repair and maintenance',
    skills: [
      'washing machine repair',
      'dishwasher repair',
      'microwave repair',
      'oven repair',
      'refrigerator repair',
      'dryer repair',
      'garbage disposal repair',
      'water heater repair',
      'small appliance repair',
      'appliance installation',
      'appliance maintenance',
      'vacuum cleaner repair'
    ]
  },

  CLEANING: {
    name: 'Cleaning',
    icon: 'fas fa-broom',
    description: 'Professional cleaning and maintenance services',
    skills: [
      'house cleaning',
      'deep cleaning',
      'carpet cleaning',
      'window cleaning',
      'office cleaning',
      'post-construction cleaning',
      'move-in/move-out cleaning',
      'pressure washing',
      'upholstery cleaning',
      'floor cleaning',
      'bathroom cleaning',
      'kitchen cleaning'
    ]
  },

  GARDENING: {
    name: 'Gardening & Landscaping',
    icon: 'fas fa-leaf',
    description: 'Garden maintenance and landscaping services',
    skills: [
      'lawn mowing',
      'garden maintenance',
      'tree trimming',
      'landscaping',
      'plant installation',
      'irrigation system',
      'hedge trimming',
      'weed removal',
      'soil preparation',
      'garden design',
      'pest control',
      'seasonal cleanup'
    ]
  },

  HANDYMAN: {
    name: 'General Handyman',
    icon: 'fas fa-toolbox',
    description: 'General maintenance and repair services',
    skills: [
      'general repairs',
      'home maintenance',
      'fixture installation',
      'drywall repair',
      'caulking',
      'weatherproofing',
      'minor electrical work',
      'minor plumbing work',
      'assembly services',
      'mounting services',
      'general troubleshooting',
      'maintenance checks'
    ]
  },

  PEST_CONTROL: {
    name: 'Pest Control',
    icon: 'fas fa-bug',
    description: 'Pest identification, elimination, and prevention services',
    skills: [
      'termite control',
      'cockroach control',
      'ant control',
      'rodent control',
      'bed bug treatment',
      'mosquito control',
      'fly control',
      'general pest control',
      'fumigation',
      'pest inspection',
      'preventive treatment',
      'organic pest control'
    ]
  }
};

// Flatten all skills into a single array for easy validation
export const ALL_AVAILABLE_SKILLS = Object.values(SERVICE_CATEGORIES)
  .flatMap(category => category.skills)
  .sort();

// Get skills by category
export const getSkillsByCategory = (categoryKey) => {
  return SERVICE_CATEGORIES[categoryKey]?.skills || [];
};

// Get category info by skill
export const getCategoryBySkill = (skill) => {
  for (const [key, category] of Object.entries(SERVICE_CATEGORIES)) {
    if (category.skills.includes(skill.toLowerCase())) {
      return { key, ...category };
    }
  }
  return null;
};

// Validate if skills are valid
export const validateSkills = (skills) => {
  if (!Array.isArray(skills)) return false;
  return skills.every(skill => 
    ALL_AVAILABLE_SKILLS.includes(skill.toLowerCase())
  );
};

// Get popular/recommended skills (most common ones)
export const POPULAR_SKILLS = [
  'electrical repair',
  'plumbing repair', 
  'ac repair',
  'house cleaning',
  'furniture assembly',
  'painting',
  'general repairs',
  'appliance repair'
];

console.log('Service skills constants loaded');