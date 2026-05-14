import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeartbeat, FaBurn, FaBandAid, FaLungs, FaSearch, FaBone, FaArrowLeft, FaCheckCircle, FaExclamationTriangle, FaAllergies, FaBrain, FaBolt, FaChild, FaEye, FaTint } from 'react-icons/fa';
import styles from './FirstAid.module.scss';

const GUIDES = [
  {
    id: 'cpr', title: 'CPR', icon: <FaHeartbeat />, category: 'Critical', color: '#ef4444',
    desc: 'Cardiopulmonary Resuscitation for cardiac arrest.',
    when: 'Person is unresponsive and not breathing normally.',
    steps: [
      { text: 'Check for responsiveness — tap shoulders and shout "Are you okay?"', important: true },
      { text: 'Call emergency services (112 or 108) immediately or ask someone nearby to call.' },
      { text: 'Place the person on their back on a firm, flat surface.' },
      { text: 'Place the heel of one hand on the center of the chest (between nipples).' },
      { text: 'Place your other hand on top and interlock your fingers.' },
      { text: 'Push hard and fast — at least 2 inches deep, at a rate of 100-120 compressions per minute.', important: true },
      { text: 'After 30 compressions, tilt the head back, lift the chin, and give 2 rescue breaths.' },
      { text: 'Each breath should last about 1 second — watch for chest rise.' },
      { text: 'Continue the 30:2 cycle until help arrives, an AED is available, or the person recovers.' }
    ],
    warnings: ['Do NOT stop CPR once started unless help arrives.', 'If you are untrained, do hands-only CPR (no breaths).']
  },
  {
    id: 'choking', title: 'Choking', icon: <FaLungs />, category: 'Critical', color: '#f59e0b',
    desc: 'Heimlich maneuver and back blows for airway obstruction.',
    when: 'Person cannot cough, speak, or breathe. May be clutching their throat.',
    steps: [
      { text: 'Ask "Are you choking?" — if they nod or cannot speak, act immediately.', important: true },
      { text: 'Stand behind the person and wrap your arms around their waist.' },
      { text: 'Make a fist with one hand and place it just above the navel.' },
      { text: 'Grasp the fist with your other hand.' },
      { text: 'Perform quick, upward abdominal thrusts (Heimlich maneuver).', important: true },
      { text: 'Repeat thrusts until the object is expelled or the person can breathe.' },
      { text: 'If the person becomes unconscious, lower them to the ground and begin CPR.' },
      { text: 'Call emergency services (112) if not already done.' }
    ],
    warnings: ['For infants: Use 5 back blows and 5 chest thrusts instead of abdominal thrusts.', 'For pregnant or obese persons: Use chest thrusts instead.']
  },
  {
    id: 'burns', title: 'Burns', icon: <FaBurn />, category: 'Standard', color: '#f97316',
    desc: 'Treatment for thermal, chemical, and electrical burns.',
    when: 'Skin is red, blistered, or charred from heat, chemicals, or electricity.',
    steps: [
      { text: 'Remove the person from the heat source immediately.', important: true },
      { text: 'Cool the burn under cool (not cold) running water for 10-20 minutes.' },
      { text: 'Do NOT use ice, butter, toothpaste, or any ointments on the burn.' },
      { text: 'Remove jewelry, watches, or tight items near the burn area before swelling starts.' },
      { text: 'Cover the burn loosely with a sterile, non-stick bandage or clean cloth.' },
      { text: 'Take over-the-counter pain medication (ibuprofen or paracetamol) if needed.' },
      { text: 'For chemical burns: flush with clean water for at least 20 minutes.', important: true },
      { text: 'Seek medical help for burns larger than 3 inches, on face/hands/joints, or if blistering is severe.' }
    ],
    warnings: ['Do NOT pop blisters — this increases infection risk.', 'Electrical burns may have internal damage even if the skin looks okay.']
  },
  {
    id: 'bleeding', title: 'Severe Bleeding', icon: <FaBandAid />, category: 'Critical', color: '#dc2626',
    desc: 'Controlling life-threatening hemorrhage and wound care.',
    when: 'Visible heavy bleeding from a wound that does not stop.',
    steps: [
      { text: 'Apply firm, direct pressure with a clean cloth or bandage.', important: true },
      { text: 'If blood soaks through, do NOT remove the cloth — add more layers on top.' },
      { text: 'Maintain pressure for at least 10-15 minutes continuously.' },
      { text: 'Elevate the wounded area above heart level if possible.' },
      { text: 'If bleeding is life-threatening and on a limb, apply a tourniquet 2-3 inches above the wound.', important: true },
      { text: 'Note the time the tourniquet was applied.' },
      { text: 'Keep the person warm and calm — signs of shock include cold skin, fast breathing, confusion.' },
      { text: 'Call emergency services (112) immediately.' }
    ],
    warnings: ['Do NOT remove embedded objects from wounds.', 'A tourniquet should only be loosened by medical professionals.']
  },
  {
    id: 'fracture', title: 'Fractures', icon: <FaBone />, category: 'Standard', color: '#8b5cf6',
    desc: 'Broken bone stabilization and immobilization.',
    when: 'Suspected broken bone — visible deformity, severe pain, swelling, inability to move.',
    steps: [
      { text: 'Do NOT try to straighten or realign the broken bone.', important: true },
      { text: 'Immobilize the injured area using a splint (padded board, rolled newspaper, or pillow).' },
      { text: 'Secure the splint with bandages or strips of cloth — not too tight.' },
      { text: 'Apply ice wrapped in a cloth to the area to reduce swelling (20 minutes on, 20 off).' },
      { text: 'Elevate the injured limb above heart level if possible.' },
      { text: 'Give pain medication if available (paracetamol or ibuprofen).' },
      { text: 'Do NOT give food or drink as surgery may be required.' },
      { text: 'Call emergency services for safe transport to a hospital.' }
    ],
    warnings: ['Moving a person with a suspected spinal injury can cause paralysis.', 'Open fractures (bone visible) need immediate ER attention.']
  },
  {
    id: 'allergic', title: 'Allergic Reaction', icon: <FaAllergies />, category: 'Critical', color: '#ec4899',
    desc: 'Anaphylaxis and severe allergic reaction management.',
    when: 'Swelling of face/throat, difficulty breathing, hives, dizziness after exposure to allergen.',
    steps: [
      { text: 'Call emergency services (112) immediately — anaphylaxis is life-threatening.', important: true },
      { text: 'If the person has an EpiPen (epinephrine auto-injector), help them use it on the outer thigh.' },
      { text: 'Help the person sit upright to assist breathing. If they feel faint, lay them down with legs elevated.' },
      { text: 'Loosen any tight clothing around neck and chest.' },
      { text: 'Monitor breathing — be ready to start CPR if they stop breathing.' },
      { text: 'If symptoms do not improve after 5-10 minutes, a second dose of epinephrine may be given.' },
      { text: 'Do NOT give oral medications if swelling affects the throat.' },
      { text: 'Stay with the person until emergency services arrive.' }
    ],
    warnings: ['Anaphylaxis can progress rapidly — seconds count.', 'Even if symptoms improve after EpiPen, the person still needs ER evaluation.']
  },
  {
    id: 'stroke', title: 'Stroke (FAST)', icon: <FaBrain />, category: 'Critical', color: '#6366f1',
    desc: 'Recognizing and responding to stroke symptoms.',
    when: 'Sudden facial drooping, arm weakness, or speech difficulty.',
    steps: [
      { text: 'Use FAST: Face drooping, Arm weakness, Speech slurred, Time to call 112.', important: true },
      { text: 'Note the EXACT time symptoms started — this is critical for treatment.' },
      { text: 'Call emergency services (112) immediately — do NOT drive to the hospital.' },
      { text: 'Have the person lie down with head and shoulders slightly elevated.' },
      { text: 'Loosen any constrictive clothing.' },
      { text: 'Do NOT give any food, drink, or medication.' },
      { text: 'If the person is unconscious but breathing, place them in the recovery position (on their side).' },
      { text: 'Be ready to perform CPR if they stop breathing.' }
    ],
    warnings: ['Every minute without treatment destroys 1.9 million brain cells.', 'Treatment within 3 hours dramatically improves outcomes.']
  },
  {
    id: 'seizure', title: 'Seizure', icon: <FaBolt />, category: 'Standard', color: '#0ea5e9',
    desc: 'How to safely help during an epileptic seizure.',
    when: 'Uncontrolled shaking, loss of consciousness, stiffening of body.',
    steps: [
      { text: 'Stay calm. Clear the area of hard or sharp objects.', important: true },
      { text: 'Do NOT hold the person down or try to stop their movements.' },
      { text: 'Do NOT put anything in their mouth — they will NOT swallow their tongue.' },
      { text: 'Gently roll them onto their side (recovery position) to prevent choking.' },
      { text: 'Place something soft (jacket, towel) under their head.' },
      { text: 'Time the seizure — call 112 if it lasts more than 5 minutes.', important: true },
      { text: 'After the seizure, stay with them and speak reassuringly.' },
      { text: 'Do not offer food or water until they are fully alert.' }
    ],
    warnings: ['Call 112 if the person has never had a seizure before.', 'Multiple seizures without regaining consciousness require immediate ER care.']
  },
  {
    id: 'poisoning', title: 'Poisoning', icon: <FaTint />, category: 'Critical', color: '#14b8a6',
    desc: 'Emergency response for ingested, inhaled, or contact poisons.',
    when: 'Suspected ingestion of toxic substance, chemicals, or medication overdose.',
    steps: [
      { text: 'Call emergency services (112) or poison control immediately.', important: true },
      { text: 'Try to identify the substance, amount, and time of exposure.' },
      { text: 'Do NOT induce vomiting unless specifically told by poison control.' },
      { text: 'If the poison is on the skin, remove contaminated clothing and rinse with water for 15-20 minutes.' },
      { text: 'If inhaled: move the person to fresh air immediately.' },
      { text: 'If the person is conscious and alert, rinse their mouth with water (do not swallow).' },
      { text: 'Save any containers, labels, or samples of the substance for medical professionals.' },
      { text: 'Monitor breathing and be ready for CPR.' }
    ],
    warnings: ['Do NOT give activated charcoal without medical advice.', 'Some poisons cause delayed symptoms — always seek medical evaluation.']
  },
  {
    id: 'drowning', title: 'Drowning', icon: <FaChild />, category: 'Critical', color: '#3b82f6',
    desc: 'Water rescue and resuscitation steps.',
    when: 'Person pulled from water who is unresponsive or not breathing.',
    steps: [
      { text: 'Remove the person from the water as safely as possible — do not become a victim yourself.', important: true },
      { text: 'Call emergency services (112) immediately.' },
      { text: 'Place the person on their back on a firm surface.' },
      { text: 'Check for breathing — look, listen, and feel for 10 seconds.' },
      { text: 'If not breathing: start with 5 rescue breaths, then begin CPR (30 compressions, 2 breaths).', important: true },
      { text: 'Continue CPR until emergency services arrive.' },
      { text: 'If the person vomits, roll them onto their side to clear the airway.' },
      { text: 'Even if the person seems recovered, they MUST go to a hospital for evaluation.' }
    ],
    warnings: ['Secondary drowning can occur hours after the incident.', 'Always supervise children near any body of water.']
  }
];

const FirstAid = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [filter, setFilter] = useState('All');

  const filteredGuides = GUIDES.filter(guide => {
    const matchSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.desc.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'All' || guide.category === filter;
    return matchSearch && matchFilter;
  });

  const toggleStep = (idx) => {
    const newSet = new Set(completedSteps);
    if (newSet.has(idx)) newSet.delete(idx);
    else newSet.add(idx);
    setCompletedSteps(newSet);
  };

  const openGuide = (guide) => {
    setSelectedGuide(guide);
    setCompletedSteps(new Set());
  };

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {!selectedGuide ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
            <header className={styles.header}>
              <div>
                <h1>🚑 First Aid Guide</h1>
                <p>Step-by-step emergency instructions — tap to follow along</p>
              </div>
              <div className={styles.searchBar}>
                <FaSearch className={styles.searchIcon} />
                <input type="text" placeholder="Search guides (CPR, Burns, Choking...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </header>

            <div className={styles.filters}>
              {['All', 'Critical', 'Standard'].map(f => (
                <button key={f} className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`} onClick={() => setFilter(f)}>
                  {f} {f === 'All' ? `(${GUIDES.length})` : `(${GUIDES.filter(g => g.category === f).length})`}
                </button>
              ))}
            </div>

            <div className={styles.grid}>
              {filteredGuides.map(guide => (
                <motion.div
                  key={guide.id}
                  className={styles.guideCard}
                  whileHover={{ y: -5 }}
                  onClick={() => openGuide(guide)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.iconWrapper} style={{ background: `${guide.color}18`, color: guide.color }}>
                      {guide.icon}
                    </div>
                    <span className={`${styles.badge} ${guide.category === 'Critical' ? styles.badgeCrit : styles.badgeStd}`}>
                      {guide.category}
                    </span>
                  </div>
                  <h3>{guide.title}</h3>
                  <p>{guide.desc}</p>
                  <div className={styles.stepsPreview}>
                    {guide.steps.length} steps • Tap to view
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={styles.emergencyNumbers}>
              <h3>🆘 Indian Emergency Numbers</h3>
              <div className={styles.numGrid}>
                <a href="tel:112" className={styles.numCard}>
                  <strong>112</strong><span>National Emergency</span>
                </a>
                <a href="tel:108" className={styles.numCard}>
                  <strong>108</strong><span>Ambulance</span>
                </a>
                <a href="tel:101" className={styles.numCard}>
                  <strong>101</strong><span>Fire</span>
                </a>
                <a href="tel:1066" className={styles.numCard}>
                  <strong>1066</strong><span>Poison Control</span>
                </a>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="detail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
            <button className={styles.backBtn} onClick={() => setSelectedGuide(null)}>
              <FaArrowLeft /> Back to All Guides
            </button>

            <div className={styles.detailHeader} style={{ '--guide-color': selectedGuide.color }}>
              <div className={styles.detailIcon} style={{ background: `${selectedGuide.color}18`, color: selectedGuide.color }}>
                {selectedGuide.icon}
              </div>
              <div>
                <span className={`${styles.badge} ${selectedGuide.category === 'Critical' ? styles.badgeCrit : styles.badgeStd}`}>
                  {selectedGuide.category}
                </span>
                <h1>{selectedGuide.title}</h1>
                <p className={styles.when}><strong>When:</strong> {selectedGuide.when}</p>
              </div>
            </div>

            {/* Warnings */}
            {selectedGuide.warnings && (
              <div className={styles.warningBox}>
                <FaExclamationTriangle />
                <div>
                  {selectedGuide.warnings.map((w, i) => (
                    <p key={i}>⚠️ {w}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            <div className={styles.stepsList}>
              <h2>Step-by-Step Instructions</h2>
              <div className={styles.progress}>
                <div className={styles.progressFill} style={{ width: `${(completedSteps.size / selectedGuide.steps.length) * 100}%` }}></div>
              </div>
              <span className={styles.progressText}>{completedSteps.size} of {selectedGuide.steps.length} completed</span>

              {selectedGuide.steps.map((step, idx) => (
                <motion.div
                  key={idx}
                  className={`${styles.stepItem} ${completedSteps.has(idx) ? styles.completed : ''} ${step.important ? styles.important : ''}`}
                  onClick={() => toggleStep(idx)}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={styles.stepNum} style={{ borderColor: completedSteps.has(idx) ? '#22c55e' : selectedGuide.color }}>
                    {completedSteps.has(idx) ? <FaCheckCircle style={{ color: '#22c55e' }} /> : idx + 1}
                  </div>
                  <div className={styles.stepContent}>
                    <p>{step.text}</p>
                    {step.important && <span className={styles.importantTag}>CRITICAL STEP</span>}
                  </div>
                </motion.div>
              ))}
            </div>

            {completedSteps.size === selectedGuide.steps.length && (
              <motion.div className={styles.completedBanner} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <FaCheckCircle /> All steps completed. Stay with the patient until help arrives.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FirstAid;
