import api from "@/lib/axios";

export interface MasterSkill {
  id: string;
  name: string;
  description?: string;
  category?: string;
  created_at?: string;
}

export interface CreateMasterSkillData {
  name: string;
  description?: string;
  category?: string;
}

export class MasterSkillsService {
  // Get all available skills from master database
  static async getAllSkills(): Promise<MasterSkill[]> {
    try {
      const response = await api.get("/skills/");
      return response.data || response || [];
    } catch (error: any) {
      throw error;
    }
  }

  // Create a new skill in master database
  static async createSkill(skillData: CreateMasterSkillData): Promise<MasterSkill> {
    try {
      const response = await api.post("/skills/", skillData);
      return response.data || response;
    } catch (error: any) {
      throw error;
    }
  }

  // Search for skills by name
  static async searchSkills(query: string): Promise<MasterSkill[]> {
    try {
      const response = await api.get(`/skills/?search=${encodeURIComponent(query)}`);
      return response.data || response || [];
    } catch (error: any) {
      // If search endpoint doesn't exist, fall back to getting all and filtering
      const allSkills = await this.getAllSkills();
      return allSkills.filter(skill => 
        skill.name.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  // Check if a skill exists by name
  static async findSkillByName(skillName: string): Promise<MasterSkill | null> {
    try {
      const skills = await this.searchSkills(skillName);
      return skills.find(skill => 
        skill.name.toLowerCase() === skillName.toLowerCase()
      ) || null;
    } catch (error) {
      return null;
    }
  }

  // Get or create a skill (find existing or create new)
  static async getOrCreateSkill(skillName: string, description?: string): Promise<MasterSkill> {
    try {
      // First, try to find existing skill
      const existing = await this.findSkillByName(skillName);
      if (existing) {
        return existing;
      }

      // If not found, create new skill
      return await this.createSkill({
        name: skillName,
        description: description || `${skillName} skill`
      });
    } catch (error: any) {
      throw error;
    }
  }
}