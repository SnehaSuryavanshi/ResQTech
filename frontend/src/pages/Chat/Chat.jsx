import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaRobot, FaUser, FaExclamationTriangle, FaCircle } from 'react-icons/fa';
import { aiAPI, emergencyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Chat.module.scss';

// Offline AI fallback for when backend is down
const offlineAnalyze = (symptoms) => {
  const lower = symptoms.toLowerCase();
  if (lower.includes('chest') || lower.includes('heart') || lower.includes('cardiac')) {
    return { severity: 'critical', predictedCondition: 'Possible Cardiac Event', riskLevel: 90, summary: 'Symptoms strongly indicate a cardiac emergency. Call 112 immediately.', firstAidInstructions: ['Call emergency services immediately', 'Have the person sit or lie down', 'Give aspirin (325mg) if not allergic', 'Begin CPR if unresponsive'], recommendedSpecialist: 'Cardiologist', confidence: 82 };
  }
  if (lower.includes('breath') || lower.includes('choking') || lower.includes('asthma')) {
    return { severity: 'high', predictedCondition: 'Respiratory Distress', riskLevel: 75, summary: 'Respiratory distress detected. Ensure airway is clear.', firstAidInstructions: ['Help the person sit upright', 'Loosen tight clothing', 'Use an inhaler if available', 'For choking: perform Heimlich maneuver'], recommendedSpecialist: 'Pulmonologist', confidence: 78 };
  }
  if (lower.includes('bleed') || lower.includes('cut') || lower.includes('wound') || lower.includes('fracture')) {
    return { severity: 'high', predictedCondition: 'Trauma / Physical Injury', riskLevel: 70, summary: 'Physical injury detected. Apply first aid and seek emergency care.', firstAidInstructions: ['Apply direct pressure to stop bleeding', 'Do NOT remove embedded objects', 'Immobilize suspected fractures', 'Keep the person warm'], recommendedSpecialist: 'Trauma Surgeon', confidence: 75 };
  }
  if (lower.includes('unconscious') || lower.includes('seizure') || lower.includes('stroke')) {
    return { severity: 'critical', predictedCondition: 'Neurological Emergency', riskLevel: 85, summary: 'Neurological emergency suspected. Time-critical intervention needed.', firstAidInstructions: ['Do NOT move the person unless in danger', 'Place in recovery position if unconscious but breathing', 'Note the time symptoms started', 'Call emergency services immediately'], recommendedSpecialist: 'Neurologist', confidence: 80 };
  }
  if (lower.includes('fever') || lower.includes('vomiting') || lower.includes('diarrhea')) {
    return { severity: 'medium', predictedCondition: 'Possible Infection / Febrile Illness', riskLevel: 40, summary: 'Moderate symptoms suggest infection. Monitor and visit a physician.', firstAidInstructions: ['Keep the person hydrated', 'Give paracetamol for high fever', 'Use cold compress on forehead', 'Seek medical attention if fever persists above 103°F'], recommendedSpecialist: 'Internal Medicine', confidence: 72 };
  }
  if (lower.includes('burn')) {
    return { severity: 'high', predictedCondition: 'Burn Injury', riskLevel: 65, summary: 'Burn injury detected. Cool the area immediately.', firstAidInstructions: ['Cool under running water for 10-20 min', 'Do NOT use ice or butter', 'Cover with sterile bandage', 'Seek medical help for severe burns'], recommendedSpecialist: 'Burn Specialist', confidence: 74 };
  }
  return { severity: 'low', predictedCondition: 'General Health Inquiry', riskLevel: 20, summary: 'Based on the symptoms described, this appears to be a non-emergency. However, if symptoms worsen, please seek medical attention.', firstAidInstructions: ['Monitor symptoms', 'Stay hydrated and rest', 'Take OTC medication if appropriate', 'Visit a doctor if symptoms persist'], recommendedSpecialist: 'General Physician', confidence: 65 };
};

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { id: 1, role: 'ai', content: `Hello${user ? ' ' + user.name : ''}! I'm ResQAI, your emergency medical assistant. Describe your symptoms and I'll analyze them immediately.\n\nTry saying:\n• "I have severe chest pain"\n• "Difficulty breathing"\n• "Heavy bleeding from a wound"` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { id: Date.now(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    let analysis = null;
    let aiContent = '';

    try {
      // Try backend first
      const analysisRes = await emergencyAPI.analyze(currentInput);
      analysis = analysisRes.data.analysis;
    } catch {
      // Fallback to offline analysis
      analysis = offlineAnalyze(currentInput);
    }

    if (analysis) {
      const severityEmoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🟢' };
      aiContent = `${severityEmoji[analysis.severity] || '⚪'} **${analysis.severity?.toUpperCase()} Severity** — ${analysis.predictedCondition}\n\n`;
      aiContent += `${analysis.summary}\n\n`;
      if (analysis.firstAidInstructions?.length > 0) {
        aiContent += `**Immediate Steps:**\n`;
        analysis.firstAidInstructions.forEach((step, i) => {
          aiContent += `${i + 1}. ${step}\n`;
        });
      }
      aiContent += `\n**Recommended:** ${analysis.recommendedSpecialist} | **Confidence:** ${analysis.confidence}%`;
    } else {
      aiContent = 'I understand your concern. Please describe your symptoms in more detail so I can provide better guidance. If this is a life-threatening emergency, please call 112 immediately.';
    }

    // Simulate typing delay for UX
    await new Promise(r => setTimeout(r, 800));

    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      role: 'ai',
      content: aiContent,
      analysis
    }]);
    setIsTyping(false);
  };

  const getSeverityClass = (severity) => {
    const map = { critical: styles.severityCritical, high: styles.severityHigh, medium: styles.severityMedium, low: styles.severityLow };
    return map[severity] || '';
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => {
      // Bold text
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  };

  return (
    <div className={styles.chatPage}>
      <div className={styles.chatContainer}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.aiAvatar}><FaRobot /></div>
            <div>
              <h2>AI Triage Assistant</h2>
              <div className={styles.status}>
                <FaCircle className={styles.statusDot} /> Online — Ready
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.chatBody}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              className={`${styles.msgRow} ${msg.role === 'user' ? styles.userRow : styles.aiRow}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`${styles.avatar} ${msg.role === 'user' ? styles.userAvatar : styles.aiAvatarSmall}`}>
                {msg.role === 'user' ? <FaUser /> : <FaRobot />}
              </div>
              <div className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble} ${msg.analysis ? getSeverityClass(msg.analysis.severity) : ''}`}>
                <div className={styles.msgContent}>
                  {formatMessage(msg.content)}
                </div>

                {msg.analysis && (
                  <div className={styles.analysisCard}>
                    <div className={styles.analysisHeader}>
                      <FaExclamationTriangle /> Risk Level: {msg.analysis.riskLevel}%
                    </div>
                    <div className={styles.riskBar}>
                      <div className={styles.riskFill} style={{ width: `${msg.analysis.riskLevel}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className={`${styles.msgRow} ${styles.aiRow}`}>
              <div className={`${styles.avatar} ${styles.aiAvatarSmall}`}><FaRobot /></div>
              <div className={`${styles.bubble} ${styles.aiBubble}`}>
                <div className={styles.typingDots}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form className={styles.chatInput} onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Describe symptoms (e.g. severe chest pain, difficulty breathing)..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim() || isTyping} className={styles.sendBtn}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
