import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * AI Service — Uses Google Gemini for symptom analysis,
 * hospital recommendations, and first aid instructions.
 * Falls back to a rule-based engine when no API key is configured.
 */
class AIService {
  constructor() {
    this.genAI = process.env.GEMINI_API_KEY
      ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
      : null;
  }

  /* ──────────── Symptom Analysis ──────────── */
  async analyzeSymptoms(symptoms) {
    if (this.genAI) {
      return this._analyzeWithGemini(symptoms);
    }
    return this._analyzeWithRules(symptoms);
  }

  async _analyzeWithGemini(symptoms) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `You are an emergency medical AI triage assistant. A patient reports: "${symptoms}"

Respond ONLY in valid JSON with these exact keys:
{
  "severity": "low" | "medium" | "high" | "critical",
  "predictedCondition": "string",
  "riskLevel": number (0-100),
  "category": "string (cardiac/respiratory/trauma/neurological/other)",
  "recommendedSpecialist": "string",
  "firstAidInstructions": ["step 1", "step 2", ...],
  "confidence": number (0-100),
  "summary": "Brief summary of the analysis"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Could not parse AI response');
    } catch (error) {
      console.error('Gemini API error, falling back to rules:', error.message);
      return this._analyzeWithRules(symptoms);
    }
  }

  _analyzeWithRules(symptoms) {
    const lower = symptoms.toLowerCase();
    let analysis = {
      severity: 'medium',
      predictedCondition: 'General discomfort',
      riskLevel: 30,
      category: 'other',
      recommendedSpecialist: 'General Physician',
      firstAidInstructions: ['Keep the patient calm', 'Monitor vital signs', 'Seek medical attention'],
      confidence: 70,
      summary: 'Based on rule-based analysis of reported symptoms.'
    };

    // Cardiac keywords
    if (lower.includes('chest pain') || lower.includes('heart') || lower.includes('cardiac')) {
      analysis = {
        severity: 'critical',
        predictedCondition: 'Possible Cardiac Event (Myocardial Infarction)',
        riskLevel: 90,
        category: 'cardiac',
        recommendedSpecialist: 'Cardiologist',
        firstAidInstructions: [
          'Call emergency services immediately',
          'Have the person sit or lie down',
          'If prescribed, help them take nitroglycerin',
          'Give aspirin (325mg) if not allergic',
          'Begin CPR if the person becomes unresponsive',
          'Use an AED if available'
        ],
        confidence: 82,
        summary: 'Symptoms strongly indicate a cardiac emergency. Immediate medical intervention required.'
      };
    }
    // Respiratory
    else if (lower.includes('breathing') || lower.includes('breath') || lower.includes('asthma') || lower.includes('choking')) {
      analysis = {
        severity: 'high',
        predictedCondition: 'Respiratory Distress',
        riskLevel: 75,
        category: 'respiratory',
        recommendedSpecialist: 'Pulmonologist',
        firstAidInstructions: [
          'Help the person sit upright',
          'Loosen any tight clothing',
          'Use an inhaler if available',
          'For choking: perform the Heimlich maneuver',
          'If breathing stops, begin rescue breathing',
          'Call emergency services'
        ],
        confidence: 78,
        summary: 'Respiratory distress detected. Ensure airway is clear and seek immediate help.'
      };
    }
    // Neurological
    else if (lower.includes('unconscious') || lower.includes('seizure') || lower.includes('stroke') || lower.includes('headache')) {
      analysis = {
        severity: 'critical',
        predictedCondition: 'Neurological Emergency',
        riskLevel: 85,
        category: 'neurological',
        recommendedSpecialist: 'Neurologist',
        firstAidInstructions: [
          'Do NOT move the person unless in danger',
          'Place in recovery position if unconscious but breathing',
          'Do NOT put anything in the mouth during a seizure',
          'Note the time the symptoms started',
          'Use FAST: Face, Arms, Speech, Time for stroke detection',
          'Call emergency services immediately'
        ],
        confidence: 80,
        summary: 'Neurological emergency suspected. Time-critical intervention needed.'
      };
    }
    // Trauma
    else if (lower.includes('bleeding') || lower.includes('fracture') || lower.includes('accident') || lower.includes('burn') || lower.includes('wound')) {
      analysis = {
        severity: 'high',
        predictedCondition: 'Trauma / Physical Injury',
        riskLevel: 70,
        category: 'trauma',
        recommendedSpecialist: 'Trauma Surgeon',
        firstAidInstructions: [
          'Apply direct pressure to stop bleeding',
          'Do NOT remove embedded objects',
          'Immobilize suspected fractures',
          'For burns: cool with running water for 10+ minutes',
          'Cover wounds with clean dressings',
          'Keep the person warm and calm'
        ],
        confidence: 75,
        summary: 'Trauma or physical injury detected. Stabilize and transport to nearest trauma center.'
      };
    }
    // Fever / Infection
    else if (lower.includes('fever') || lower.includes('vomiting') || lower.includes('diarrhea') || lower.includes('infection')) {
      analysis = {
        severity: 'medium',
        predictedCondition: 'Possible Infection / Febrile Illness',
        riskLevel: 40,
        category: 'other',
        recommendedSpecialist: 'Internal Medicine',
        firstAidInstructions: [
          'Keep the person hydrated',
          'Give paracetamol for high fever (if not contraindicated)',
          'Use cold compress on forehead',
          'Monitor temperature regularly',
          'Seek medical attention if fever persists above 103°F'
        ],
        confidence: 72,
        summary: 'Moderate symptoms suggest infection or febrile illness. Monitor and visit a physician.'
      };
    }

    return analysis;
  }

  /* ──────────── Chat with AI ──────────── */
  async chat(message, conversationHistory = []) {
    if (this.genAI) {
      try {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const systemPrompt = `You are ResQAI, an emergency healthcare AI assistant. Be concise, professional, and focused on medical emergencies. Provide actionable advice. If the situation is critical, emphasize the urgency.`;

        const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\nUser: ${message}\nAssistant:`;

        const result = await model.generateContent(fullPrompt);
        return result.response.text();
      } catch (error) {
        console.error('Gemini chat error:', error.message);
        return this._fallbackChat(message);
      }
    }
    return this._fallbackChat(message);
  }

  _fallbackChat(message) {
    const lower = message.toLowerCase();
    if (lower.includes('chest') || lower.includes('heart')) {
      return 'This could be a cardiac emergency. Please call emergency services immediately. While waiting: sit or lie down, take aspirin if not allergic, and stay calm. I am locating the nearest cardiac center for you.';
    }
    if (lower.includes('bleed') || lower.includes('cut') || lower.includes('wound')) {
      return 'Apply firm direct pressure to the wound with a clean cloth. Elevate the injured area above heart level if possible. Do NOT remove the cloth if it soaks through — add more on top. Seek emergency care for severe bleeding.';
    }
    if (lower.includes('breath') || lower.includes('choking')) {
      return 'If someone is choking: stand behind them, place your fist above the navel, and give upward abdominal thrusts. For breathing difficulty: sit upright, use an inhaler if available, and call emergency services.';
    }
    return 'I understand your concern. Please describe your symptoms in more detail so I can provide better guidance. If this is a life-threatening emergency, please press the SOS button or call your local emergency number immediately.';
  }

  /* ──────────── Hospital Ranking ──────────── */
  rankHospitals(hospitals, emergency) {
    const severity = emergency?.aiAnalysis?.severity || 'medium';
    const category = emergency?.aiAnalysis?.category || 'other';

    return hospitals.map(h => {
      let score = 50; // base

      // Distance-based (lower is better, passed as pre-calculated field)
      if (h.distance) {
        score += Math.max(0, 30 - h.distance * 3);
      }

      // Bed availability
      const totalAvailable = (h.beds?.general?.available || 0)
        + (h.beds?.icu?.available || 0)
        + (h.beds?.oxygen?.available || 0);
      score += Math.min(totalAvailable * 2, 20);

      // ICU priority for critical cases
      if ((severity === 'critical' || severity === 'high') && h.beds?.icu?.available > 0) {
        score += 25;
      }

      // Specialty match
      if (h.specialties?.some(s => s.toLowerCase().includes(category))) {
        score += 20;
      }

      // Trauma support for trauma cases
      if (category === 'trauma' && h.traumaSupport) {
        score += 15;
      }

      // Rating bonus
      score += (h.rating || 0) * 3;

      // Wait time penalty
      score -= Math.min((h.waitTime || 0) / 2, 10);

      return { ...h.toObject ? h.toObject() : h, aiScore: Math.round(Math.min(score, 100)) };
    }).sort((a, b) => b.aiScore - a.aiScore);
  }
}

export default new AIService();
