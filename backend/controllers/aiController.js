import aiService from '../services/aiService.js';

/**
 * @desc    AI Chat endpoint
 * @route   POST /api/ai/chat
 */
export const aiChat = async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    const response = await aiService.chat(message, history || []);
    res.json({ success: true, response });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    AI First Aid guidance
 * @route   POST /api/ai/first-aid
 */
export const getFirstAid = async (req, res, next) => {
  try {
    const { emergency_type } = req.body;
    const guides = {
      cpr: {
        title: 'CPR (Cardiopulmonary Resuscitation)',
        steps: [
          'Check responsiveness — tap shoulders and shout',
          'Call emergency services (911/112)',
          'Place the person on their back on a firm surface',
          'Place heel of one hand on center of chest',
          'Place other hand on top and interlock fingers',
          'Push hard and fast — 2 inches deep, 100-120 per minute',
          'After 30 compressions, give 2 rescue breaths',
          'Tilt head back, lift chin, seal lips, blow for 1 second',
          'Continue 30:2 cycle until help arrives or person recovers'
        ]
      },
      choking: {
        title: 'Choking Emergency',
        steps: [
          'Ask "Are you choking?" — if they nod, act fast',
          'Stand behind the person, wrap arms around waist',
          'Make a fist with one hand above the navel',
          'Grasp fist with other hand',
          'Give quick upward abdominal thrusts',
          'Repeat until object is expelled',
          'If person becomes unconscious, begin CPR',
          'Call emergency services'
        ]
      },
      burns: {
        title: 'Burn Treatment',
        steps: [
          'Remove from heat source immediately',
          'Cool the burn under cool running water for 10-20 minutes',
          'Do NOT use ice, butter, or ointments',
          'Remove jewelry or tight items near the burn',
          'Cover with a sterile, non-stick bandage',
          'Take over-the-counter pain medication',
          'Seek medical help for burns larger than 3 inches',
          'For chemical burns: flush with water for 20+ minutes'
        ]
      },
      bleeding: {
        title: 'Severe Bleeding Control',
        steps: [
          'Apply firm, direct pressure with a clean cloth',
          'If blood soaks through, add more cloth on top',
          'Do NOT remove the original cloth',
          'Elevate the wounded area above heart level',
          'Apply a tourniquet if bleeding is life-threatening',
          'Keep the person warm and calm',
          'Call emergency services',
          'Monitor for signs of shock'
        ]
      },
      fracture: {
        title: 'Fracture First Aid',
        steps: [
          'Do NOT try to straighten or move the broken bone',
          'Immobilize the injured area with a splint',
          'Use a padded board, rolled newspaper, or pillow',
          'Apply ice wrapped in cloth to reduce swelling',
          'Elevate the limb if possible',
          'Give pain medication if available',
          'Do NOT give food or drink (surgery may be needed)',
          'Call emergency services for transport'
        ]
      }
    };

    const guide = guides[emergency_type] || guides.cpr;
    res.json({ success: true, guide });
  } catch (error) {
    next(error);
  }
};
