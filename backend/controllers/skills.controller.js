// controllers/skills.controller.js
// API endpoints for managing skills and service categories

import { 
  SERVICE_CATEGORIES, 
  ALL_AVAILABLE_SKILLS, 
  POPULAR_SKILLS,
  getCategoryBySkill,
  validateSkills 
} from "../constants/serviceSkills.js";

// GET /api/skills/categories
// Get all service categories with their skills
export const getServiceCategories = async (req, res) => {
  try {
    res.json({
      success: true,
      categories: SERVICE_CATEGORIES,
      totalCategories: Object.keys(SERVICE_CATEGORIES).length,
      totalSkills: ALL_AVAILABLE_SKILLS.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/skills/all
// Get all available skills (flat array)
export const getAllSkills = async (req, res) => {
  try {
    res.json({
      success: true,
      skills: ALL_AVAILABLE_SKILLS,
      totalCount: ALL_AVAILABLE_SKILLS.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/skills/popular
// Get popular/recommended skills
export const getPopularSkills = async (req, res) => {
  try {
    res.json({
      success: true,
      skills: POPULAR_SKILLS,
      message: "Most requested skills"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/skills/category/:categoryKey
// Get skills by specific category
export const getSkillsByCategory = async (req, res) => {
  try {
    const { categoryKey } = req.params;
    const categoryInfo = SERVICE_CATEGORIES[categoryKey.toUpperCase()];
    
    if (!categoryInfo) {
      return res.status(404).json({ 
        message: 'Category not found',
        availableCategories: Object.keys(SERVICE_CATEGORIES)
      });
    }

    res.json({
      success: true,
      category: categoryInfo,
      categoryKey: categoryKey.toUpperCase()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/skills/validate
// Validate a list of skills
export const validateSkillsEndpoint = async (req, res) => {
  try {
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ 
        message: 'Skills must be provided as an array' 
      });
    }

    const normalizedSkills = skills.map(s => String(s).trim().toLowerCase());
    const isValid = validateSkills(normalizedSkills);
    
    if (isValid) {
      // Find which categories these skills belong to
      const categoriesInfo = normalizedSkills.map(skill => {
        const category = getCategoryBySkill(skill);
        return {
          skill,
          category: category ? {
            key: category.key,
            name: category.name,
            icon: category.icon
          } : null
        };
      });

      res.json({
        success: true,
        valid: true,
        skills: normalizedSkills,
        categoriesInfo,
        message: 'All skills are valid'
      });
    } else {
      const invalidSkills = normalizedSkills.filter(
        skill => !ALL_AVAILABLE_SKILLS.includes(skill)
      );

      res.status(400).json({
        success: false,
        valid: false,
        invalidSkills,
        message: 'Some skills are invalid',
        availableSkills: ALL_AVAILABLE_SKILLS
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/skills/search?q=query
// Search for skills by keyword
export const searchSkills = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ 
        message: 'Search query is required' 
      });
    }

    const query = q.toLowerCase().trim();
    const matchingSkills = ALL_AVAILABLE_SKILLS.filter(skill =>
      skill.includes(query) || 
      query.split(' ').some(word => skill.includes(word))
    );

    // Group results by category
    const resultsByCategory = {};
    matchingSkills.forEach(skill => {
      const categoryInfo = getCategoryBySkill(skill);
      if (categoryInfo) {
        if (!resultsByCategory[categoryInfo.key]) {
          resultsByCategory[categoryInfo.key] = {
            category: categoryInfo.name,
            icon: categoryInfo.icon,
            skills: []
          };
        }
        resultsByCategory[categoryInfo.key].skills.push(skill);
      }
    });

    res.json({
      success: true,
      query,
      totalResults: matchingSkills.length,
      skills: matchingSkills,
      resultsByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

console.log('Skills controller loaded');