import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaUser, FaHeartbeat, FaPills, FaShieldAlt, FaPhoneAlt,
  FaHospital, FaHandHoldingHeart, FaSave,
  FaQrcode, FaUsers, FaIdCard, FaEdit, FaTint,
  FaAllergies, FaNotesMedical, FaFileMedical, FaCheck
} from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from './Profile.module.scss';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LANGUAGES = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Tamil', 'Telugu', 'Kannada', 'Bengali'];

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    fullName: '',
    dob: '',
    bloodGroup: '',
    allergies: '',
    medications: '',
    chronicConditions: '',
    insurance: '',
    emergencyContacts: [
      { name: '', phone: '', relation: '' },
      { name: '', phone: '', relation: '' },
    ],
    preferredHospitals: '',
    language: 'English',
    organDonor: false,
  });

  const [familyTracking, setFamilyTracking] = useState([]);

  // Load from user data
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || '',
        dob: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: user.bloodGroup || '',
        allergies: (user.allergies || []).join(', '),
        medications: (user.medications || []).join('\n'),
        chronicConditions: user.chronicConditions || (user.medicalConditions || []).join(', '),
        insurance: user.insurance || '',
        emergencyContacts: user.emergencyContacts?.length >= 1
          ? [
              ...user.emergencyContacts.slice(0, 2),
              ...Array(Math.max(0, 2 - user.emergencyContacts.length)).fill({ name: '', phone: '', relation: '' })
            ]
          : [{ name: '', phone: '', relation: '' }, { name: '', phone: '', relation: '' }],
        preferredHospitals: user.preferredHospitals || '',
        language: user.language || 'English',
        organDonor: user.organDonor || false,
      });
      setFamilyTracking(user.familyTracking || [
        { name: 'Emergency Contact 1', phone: '', enabled: true },
      ]);
    }
  }, [user]);

  const updateField = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateContact = (index, field, value) => {
    setProfile(prev => {
      const contacts = [...prev.emergencyContacts];
      contacts[index] = { ...contacts[index], [field]: value };
      return { ...prev, emergencyContacts: contacts };
    });
  };

  // Generate QR data in vCard-like format for better scanning
  const qrData = `BEGIN:VCARD
VERSION:3.0
FN:${profile.fullName}
TEL:${profile.emergencyContacts[0]?.phone || ''}
NOTE:Blood Group: ${profile.bloodGroup}\\nAllergies: ${profile.allergies}\\nConditions: ${profile.chronicConditions}\\nMedications: ${profile.medications.replace(/\n/g, ', ')}\\nInsurance: ${profile.insurance}\\nOrgan Donor: ${profile.organDonor ? 'Yes' : 'No'}\\nEmergency Contact: ${profile.emergencyContacts[0]?.name || ''} (${profile.emergencyContacts[0]?.phone || ''})
END:VCARD`;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: profile.fullName,
        dateOfBirth: profile.dob ? new Date(profile.dob) : undefined,
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies.split(',').map(a => a.trim()).filter(Boolean),
        medications: profile.medications.split('\n').map(m => m.trim()).filter(Boolean),
        chronicConditions: profile.chronicConditions,
        medicalConditions: profile.chronicConditions.split(',').map(c => c.trim()).filter(Boolean),
        insurance: profile.insurance,
        emergencyContacts: profile.emergencyContacts.filter(c => c.name && c.phone),
        preferredHospitals: profile.preferredHospitals,
        language: profile.language,
        organDonor: profile.organDonor,
        familyTracking: familyTracking.filter(f => f.name),
      };

      const res = await authAPI.updateProfile(payload);
      if (res.data.success) {
        // Update local storage and context
        const updatedUser = res.data.user;
        localStorage.setItem('resqai_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setEditing(false);
        toast.success('Profile saved successfully! ✅');
      }
    } catch (err) {
      // Save locally if backend unavailable
      const localUser = {
        ...(user || {}),
        name: profile.fullName,
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies.split(',').map(a => a.trim()).filter(Boolean),
        medications: profile.medications.split('\n').map(m => m.trim()).filter(Boolean),
        chronicConditions: profile.chronicConditions,
        insurance: profile.insurance,
        emergencyContacts: profile.emergencyContacts.filter(c => c.name && c.phone),
        preferredHospitals: profile.preferredHospitals,
        language: profile.language,
        organDonor: profile.organDonor,
        familyTracking: familyTracking.filter(f => f.name),
      };
      localStorage.setItem('resqai_user', JSON.stringify(localUser));
      setUser(localUser);
      setEditing(false);
      toast.success('Profile saved locally (server offline)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <FaFileMedical className={styles.headerIcon} />
          <div>
            <h1>Emergency Medical Passport</h1>
            <p className={styles.headerSub}>Your critical medical information — accessible to first responders</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.qrBtn} onClick={() => setShowQR(!showQR)}>
            <FaQrcode /> QR Access
          </button>
          <button className={editing ? styles.saveBtn : styles.editBtn} onClick={editing ? handleSave : () => setEditing(true)} disabled={saving}>
            {saving ? <span className={styles.spinner}></span> : editing ? <><FaSave /> Save Profile</> : <><FaEdit /> Edit Profile</>}
          </button>
        </div>
      </header>

      {/* QR Code Modal */}
      {showQR && (
        <motion.div className={styles.qrModal} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setShowQR(false)}>
          <div className={styles.qrCard} onClick={e => e.stopPropagation()}>
            <h3><FaQrcode /> Emergency QR Code</h3>
            <p>Paramedics scan this vCard to get your emergency info instantly</p>
            <div className={styles.qrWrapper}>
              <QRCodeSVG value={qrData} size={220} bgColor="#ffffff" fgColor="#1a1a2e" level="M" />
            </div>
            <div className={styles.qrInfo}>
              <span><FaTint /> {profile.bloodGroup || 'Not set'}</span>
              <span><FaUser /> {profile.fullName || 'Not set'}</span>
              <span>{profile.organDonor ? '✅ Organ Donor' : '❌ Not Donor'}</span>
            </div>
            <p className={styles.qrHint}>Contains: Name, Blood Group, Allergies, Medications, Emergency Contact, Insurance in vCard format</p>
            <button className={styles.qrClose} onClick={() => setShowQR(false)}>Close</button>
          </div>
        </motion.div>
      )}

      <div className={styles.grid}>
        {/* Personal Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaIdCard className={styles.cardIcon} />
            <h2>Personal Information</h2>
          </div>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label>Full Name</label>
              {editing ? <input value={profile.fullName} onChange={e => updateField('fullName', e.target.value)} /> : <div className={styles.value}>{profile.fullName || 'Not set'}</div>}
            </div>
            <div className={styles.field}>
              <label>Date of Birth</label>
              {editing ? <input type="date" value={profile.dob} onChange={e => updateField('dob', e.target.value)} /> : <div className={styles.value}>{profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</div>}
            </div>
            <div className={styles.field}>
              <label>Blood Group</label>
              {editing ? (
                <select value={profile.bloodGroup} onChange={e => updateField('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              ) : <div className={`${styles.value} ${styles.bloodValue}`}>{profile.bloodGroup || 'Not set'}</div>}
            </div>
            <div className={styles.field}>
              <label>Language Preference</label>
              {editing ? (
                <select value={profile.language} onChange={e => updateField('language', e.target.value)}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              ) : <div className={styles.value}>{profile.language}</div>}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaHeartbeat className={styles.cardIconDanger} />
            <h2>Medical Information</h2>
          </div>
          <div className={styles.fieldGrid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label><FaAllergies /> Allergies</label>
              {editing ? <input value={profile.allergies} onChange={e => updateField('allergies', e.target.value)} placeholder="e.g. Peanuts, Penicillin" /> : (
                profile.allergies ? (
                  <div className={styles.tagList}>
                    {profile.allergies.split(',').map((a, i) => <span key={i} className={styles.tagDanger}>{a.trim()}</span>)}
                  </div>
                ) : <div className={styles.value}>None recorded</div>
              )}
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label><FaPills /> Current Medications</label>
              {editing ? <textarea value={profile.medications} onChange={e => updateField('medications', e.target.value)} rows={3} placeholder="One per line, e.g.&#10;Albuterol Inhaler — As needed&#10;Loratadine 10mg — Daily" /> : (
                profile.medications ? (
                  <ul className={styles.medList}>
                    {profile.medications.split('\n').filter(Boolean).map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                ) : <div className={styles.value}>None recorded</div>
              )}
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label><FaNotesMedical /> Chronic Conditions</label>
              {editing ? <input value={profile.chronicConditions} onChange={e => updateField('chronicConditions', e.target.value)} placeholder="e.g. Asthma, Diabetes" /> : (
                profile.chronicConditions ? (
                  <div className={styles.tagList}>
                    {profile.chronicConditions.split(',').map((c, i) => <span key={i} className={styles.tagWarning}>{c.trim()}</span>)}
                  </div>
                ) : <div className={styles.value}>None recorded</div>
              )}
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaShieldAlt className={styles.cardIconAccent} />
            <h2>Insurance & Preferences</h2>
          </div>
          <div className={styles.fieldGrid}>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label>Insurance Provider</label>
              {editing ? <input value={profile.insurance} onChange={e => updateField('insurance', e.target.value)} placeholder="e.g. Star Health — Policy #SH-847291" /> : <div className={styles.value}>{profile.insurance || 'Not set'}</div>}
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label><FaHospital /> Preferred Hospitals</label>
              {editing ? <input value={profile.preferredHospitals} onChange={e => updateField('preferredHospitals', e.target.value)} placeholder="e.g. Tapadia Hospital, Lifeline Hospital" /> : <div className={styles.value}>{profile.preferredHospitals || 'Not set'}</div>}
            </div>
            <div className={styles.field}>
              <label><FaHandHoldingHeart /> Organ Donor Status</label>
              {editing ? (
                <label className={styles.toggleLabel}>
                  <input type="checkbox" checked={profile.organDonor} onChange={e => updateField('organDonor', e.target.checked)} />
                  <span className={styles.toggleSlider}></span>
                  {profile.organDonor ? 'Registered Donor' : 'Not a Donor'}
                </label>
              ) : (
                <div className={`${styles.value} ${profile.organDonor ? styles.donorActive : ''}`}>
                  {profile.organDonor ? '✅ Registered Organ Donor' : '❌ Not a Donor'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaPhoneAlt className={styles.cardIconSuccess} />
            <h2>Emergency Contacts</h2>
          </div>
          <div className={styles.contactList}>
            {profile.emergencyContacts.map((c, i) => (
              <div key={i} className={styles.contactCard}>
                {editing ? (
                  <div className={styles.contactEditGrid}>
                    <input placeholder="Name" value={c.name} onChange={e => updateContact(i, 'name', e.target.value)} />
                    <input placeholder="Phone" value={c.phone} onChange={e => updateContact(i, 'phone', e.target.value)} />
                    <input placeholder="Relation" value={c.relation} onChange={e => updateContact(i, 'relation', e.target.value)} />
                  </div>
                ) : c.name ? (
                  <>
                    <div className={styles.contactAvatar}>{c.name.charAt(0)}</div>
                    <div className={styles.contactInfo}>
                      <strong>{c.name}</strong>
                      <span>{c.relation}</span>
                      <a href={`tel:${c.phone}`}>{c.phone}</a>
                    </div>
                    <a href={`tel:${c.phone}`} className={styles.callBtn}><FaPhoneAlt /></a>
                  </>
                ) : (
                  <div className={styles.emptyContact}>
                    <p>No contact set — {editing ? 'fill in details' : 'edit to add'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Family Tracking */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FaUsers className={styles.cardIconSecondary} />
            <h2>Family Tracking</h2>
          </div>
          <p className={styles.cardDesc}>Family members receive real-time updates during emergencies</p>
          <div className={styles.familyList}>
            {profile.emergencyContacts.filter(c => c.name).map((c, i) => (
              <div key={i} className={styles.familyItem}>
                <div className={styles.familyInfo}>
                  <strong>{c.name}</strong>
                  <span>Will receive SMS alerts during emergencies</span>
                </div>
                <label className={styles.toggleLabel}>
                  <input type="checkbox" defaultChecked />
                  <span className={styles.toggleSlider}></span>
                </label>
              </div>
            ))}
            {profile.emergencyContacts.filter(c => c.name).length === 0 && (
              <p className={styles.emptyContact}>Add emergency contacts to enable family tracking</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
