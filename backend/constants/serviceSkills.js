// constants/serviceSkills.js
// Predefined service categories and skills for technician specializations

export const SERVICE_CATEGORIES = {
  PLUMBING: {
    name: 'Plumbing Service',
    icon: 'fas fa-wrench',
    description: 'Professional plumbing services',
    skills: ['plumbing']
  },
  
  ELECTRICAL: {
    name: 'Electrical Service',
    icon: 'fas fa-bolt',
    description: 'Professional electrical services',
    skills: ['electrical']
  },
  
  AC_HVAC: {
    name: 'AC Repair',
    icon: 'fas fa-snowflake',
    description: 'Air conditioning and HVAC services',
    skills: ['ac repair']
  },
  
  PAINTING: {
    name: 'Painting',
    icon: 'fas fa-paint-brush',
    description: 'Interior and exterior painting services',
    skills: ['painting']
  },
  
  CARPENTRY: {
    name: 'Carpentry',
    icon: 'fas fa-hammer',
    description: 'Wood work and carpentry services',
    skills: ['carpentry']
  },
  
  APPLIANCE_REPAIR: {
    name: 'Appliance Repair',
    icon: 'fas fa-tools',
    description: 'Home appliance repair and maintenance',
    skills: ['appliance repair']
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
  if (!skill) return null;
  const normalizedSkill = String(skill).trim().toLowerCase();
  
  for (const [key, category] of Object.entries(SERVICE_CATEGORIES)) {
    if (normalizedSkill === category.name.toLowerCase()) {
      return { key, ...category };
    }
  }
  return null;
};

// Validate if skills are valid
export const validateSkills = (skills) => {
  if (!Array.isArray(skills)) return false;
  
  // Normalize skills and check against service category names
  const normalizedSkills = skills.map(s => String(s).trim().toLowerCase());
  const validSkills = Object.values(SERVICE_CATEGORIES)
    .map(category => category.name.toLowerCase());
  
  return normalizedSkills.every(skill => 
    validSkills.includes(skill)
  );
};

// Get popular/recommended skills (most common ones)
export const POPULAR_SKILLS = [
  'plumbing', 
  'electrical', 
  'ac repair', 
  'painting', 
  'carpentry', 
  'appliance repair'
];

console.log('Service skills constants loaded');