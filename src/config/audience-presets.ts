import { AudienceProfile } from "@/stores/generation-store";

export interface PresetAudienceProfile extends AudienceProfile {
  id: string;
  description: string;
  icon: string;
  colorClass: string;
}

export const DEFAULT_AUDIENCE_PRESETS: PresetAudienceProfile[] = [
  {
    id: "urban-creative",
    name: "Urban Creative",
    description:
      "Design-forward, culturally engaged professionals in major cities",
    icon: "🎨",
    colorClass: "bg-purple-500",
    tone: "Conversational",
    style: "Inspirational",
    targetDemographic:
      "Ages 25-40, urban centers (NYC, SF, LA, Austin), creative professionals in design, tech, media, and arts. College-educated, progressive values, high cultural engagement.",
    painPoints: [
      "Standing out in a saturated creative market",
      "Maintaining authenticity while scaling",
      "Balancing artistic vision with commercial viability",
      "Combating creative burnout",
      "Imposter syndrome in competitive environments",
    ],
    goals: [
      "Build a distinctive personal brand",
      "Create work that makes cultural impact",
      "Grow audience and influence organically",
      "Monetize creativity sustainably",
      "Connect with like-minded innovators",
    ],
  },
  {
    id: "corporate-professional",
    name: "Corporate Professional",
    description: "Business leaders and decision-makers focused on results",
    icon: "💼",
    colorClass: "bg-blue-600",
    tone: "Professional",
    style: "Informative",
    targetDemographic:
      "Ages 30-55, suburban and urban areas, mid to senior-level managers, executives, B2B decision-makers. MBA holders, pragmatic, data-driven, results-oriented.",
    painPoints: [
      "Limited time for strategic thinking",
      "Pressure to demonstrate clear ROI",
      "Keeping up with industry disruption",
      "Managing distributed teams effectively",
      "Information overload from multiple sources",
    ],
    goals: [
      "Drive measurable business outcomes",
      "Advance career to next level",
      "Optimize team performance and efficiency",
      "Stay ahead of industry trends",
      "Build professional network and influence",
    ],
  },
  {
    id: "heartland-american",
    name: "Heartland American",
    description:
      "Traditional, community-focused individuals in small-town America",
    icon: "🏡",
    colorClass: "bg-amber-600",
    tone: "Friendly",
    style: "Educational",
    targetDemographic:
      "Ages 35-65+, rural and small-town areas (population <50k), family and faith-oriented, traditional values, blue-collar and small business owners. Strong community ties.",
    painPoints: [
      "Feeling overlooked by mainstream culture and media",
      "Economic uncertainty and job stability",
      "Preserving traditional values in changing times",
      "Limited access to resources and services",
      "Keeping family together in difficult times",
    ],
    goals: [
      "Support and strengthen local community",
      "Provide security and stability for family",
      "Maintain and pass on traditional values",
      "Achieve financial independence",
      "Make a difference in their town",
    ],
  },
  {
    id: "digital-native",
    name: "Digital Native",
    description: "Gen Z and young Millennials building online-first lives",
    icon: "📱",
    colorClass: "bg-pink-500",
    tone: "Casual",
    style: "Entertaining",
    targetDemographic:
      "Ages 18-30, digital-first, globally connected, diverse backgrounds, socially conscious, TikTok/Instagram native. Values authenticity, mental health awareness, and social justice.",
    painPoints: [
      "Constant information overload and FOMO",
      "Difficulty distinguishing authentic from performative",
      "Career path uncertainty in gig economy",
      "Mental health challenges and anxiety",
      "Financial stress (student debt, housing costs)",
    ],
    goals: [
      "Build genuine connections and community",
      "Make positive social or environmental impact",
      "Achieve financial independence early",
      "Maintain work-life balance and mental health",
      "Express authentic self without judgment",
    ],
  },
  {
    id: "wellness-enthusiast",
    name: "Wellness Enthusiast",
    description: "Health-conscious individuals seeking holistic balance",
    icon: "🧘",
    colorClass: "bg-green-500",
    tone: "Empathetic",
    style: "Inspirational",
    targetDemographic:
      "Ages 25-50, urban and suburban, health and wellness focused, interested in mindfulness, nutrition, fitness, and personal development. Mix of backgrounds, emphasis on self-care.",
    painPoints: [
      "Chronic stress and burnout from modern life",
      "Overwhelmed by conflicting health information",
      "Struggling to maintain healthy habits consistently",
      "Difficulty finding work-life-wellness balance",
      "Guilt around self-care and setting boundaries",
    ],
    goals: [
      "Improve physical and mental wellbeing",
      "Develop sustainable healthy habits",
      "Achieve inner peace and emotional balance",
      "Inspire others on wellness journey",
      "Create holistic lifestyle integration",
    ],
  },
  {
    id: "established-expert",
    name: "Established Expert",
    description:
      "Experienced professionals transitioning to legacy and mentorship",
    icon: "🎓",
    colorClass: "bg-slate-600",
    tone: "Authoritative",
    style: "Analytical",
    targetDemographic:
      "Ages 55-70+, established careers, industry veterans, thought leaders, seeking to share knowledge and build legacy. High expertise, financial security, focused on impact over income.",
    painPoints: [
      "Adapting to rapid technological change",
      "Staying relevant in evolving industries",
      "Finding meaningful next chapter after career peak",
      "Bridging generational gaps in workplace",
      "Determining how to preserve and share lifetime knowledge",
    ],
    goals: [
      "Share decades of expertise with next generation",
      "Build lasting legacy and thought leadership",
      "Mentor and guide emerging professionals",
      "Stay intellectually engaged and current",
      "Transition gracefully into new life phase",
    ],
  },
];

export function getPresetById(id: string): PresetAudienceProfile | undefined {
  return DEFAULT_AUDIENCE_PRESETS.find((preset) => preset.id === id);
}

export function getPresetsByDemographic(
  demographic: string
): PresetAudienceProfile[] {
  return DEFAULT_AUDIENCE_PRESETS.filter((preset) =>
    preset.targetDemographic.toLowerCase().includes(demographic.toLowerCase())
  );
}
