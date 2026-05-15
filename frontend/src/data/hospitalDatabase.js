// ═══════════════════════════════════════════════════════
//  ResQAI — Real Hospital Database for Maharashtra
// ═══════════════════════════════════════════════════════

export const MAHARASHTRA_HOSPITALS = {
  jalgaon: [
    { _id: 'jlg1', name: 'Dr. Ulhas Patil Medical College & Hospital', address: 'Jalgaon-Bhusawal Road, Jalgaon 425309', phone: '+91 257 226 4455', lat: 20.9898, lng: 75.5425, specialties: ['Trauma','Cardiac Surgery','Neurosurgery','Oncology','Orthopedics'], distance: 5.1, rating: 4.6, beds: { general: { available: 85 }, icu: { available: 12 } }, traumaSupport: true, waitTime: 8, open24x7: true },
    { _id: 'jlg2', name: 'Tapadia Diagnostic Centre & Hospital', address: 'Ring Road, Jalgaon 425001', phone: '+91 257 222 3344', lat: 21.0077, lng: 75.5626, specialties: ['Diagnostics','General Medicine','Cardiology','Radiology'], distance: 2.4, rating: 4.5, beds: { general: { available: 20 }, icu: { available: 5 } }, traumaSupport: false, waitTime: 5, open24x7: true },
    { _id: 'jlg3', name: 'Lifeline Hospital', address: 'Akashwani Rd, Jalgaon 425001', phone: '+91 257 223 5566', lat: 21.013, lng: 75.565, specialties: ['Emergency','Orthopedics','Neurology','Urology'], distance: 3.8, rating: 4.3, beds: { general: { available: 28 }, icu: { available: 6 } }, traumaSupport: true, waitTime: 10, open24x7: true },
    { _id: 'jlg4', name: 'Platinum Hospital', address: 'Shirsoli Road, Jalgaon 425001', phone: '+91 257 225 1122', lat: 21.0105, lng: 75.571, specialties: ['Cardiology','Orthopedics','Gynecology','Pediatrics'], distance: 4.2, rating: 4.4, beds: { general: { available: 22 }, icu: { available: 4 } }, traumaSupport: false, waitTime: 7, open24x7: true },
    { _id: 'jlg5', name: 'Balaji Superspeciality Hospital', address: 'MJ College Road, Jalgaon 425001', phone: '+91 257 224 7890', lat: 21.0155, lng: 75.558, specialties: ['Cardiac','Neuro','Gastroenterology','Pulmonology'], distance: 3.1, rating: 4.2, beds: { general: { available: 35 }, icu: { available: 8 } }, traumaSupport: true, waitTime: 12, open24x7: true },
    { _id: 'jlg6', name: 'Choithram Netralaya & Eye Hospital', address: 'Navi Peth, Jalgaon 425001', phone: '+91 257 223 9900', lat: 21.0062, lng: 75.5688, specialties: ['Ophthalmology','Laser Eye Surgery','Retina'], distance: 2.0, rating: 4.7, beds: { general: { available: 15 }, icu: { available: 1 } }, traumaSupport: false, waitTime: 3, open24x7: false },
    { _id: 'jlg7', name: 'Suyash Hospital', address: 'Ajantha Road, Jalgaon 425001', phone: '+91 257 225 5577', lat: 21.002, lng: 75.5745, specialties: ['General Surgery','ENT','Urology','Dermatology'], distance: 3.5, rating: 4.1, beds: { general: { available: 18 }, icu: { available: 3 } }, traumaSupport: false, waitTime: 15, open24x7: true },
    { _id: 'jlg8', name: 'Civil Hospital Jalgaon', address: 'Near Mehrun Lake, Jalgaon 425001', phone: '+91 257 222 0112', lat: 21.0048, lng: 75.556, specialties: ['General Medicine','Surgery','Pediatrics','Obstetrics'], distance: 1.8, rating: 3.8, beds: { general: { available: 55 }, icu: { available: 7 } }, traumaSupport: true, waitTime: 20, open24x7: true },
    { _id: 'jlg9', name: 'Shraddha Hospital', address: 'Nehru Chowk, Jalgaon 425001', phone: '+91 257 222 3456', lat: 21.0095, lng: 75.5635, specialties: ['General Medicine','Pediatrics','Gynecology'], distance: 2.1, rating: 4.0, beds: { general: { available: 20 }, icu: { available: 3 } }, traumaSupport: false, waitTime: 10, open24x7: true },
    { _id: 'jlg10', name: 'Jain Hospital & Research Centre', address: 'Navi Peth, Jalgaon 425001', phone: '+91 257 224 5678', lat: 21.008, lng: 75.566, specialties: ['Orthopedics','General Surgery','Physiotherapy'], distance: 2.5, rating: 4.1, beds: { general: { available: 25 }, icu: { available: 4 } }, traumaSupport: false, waitTime: 8, open24x7: true },
  ],
  pune: [
    { _id: 'pn1', name: 'Sahyadri Super Speciality Hospital', address: 'Deccan Gymkhana, Pune 411004', phone: '+91 20 6721 3000', lat: 18.5167, lng: 73.8414, specialties: ['Cardiac','Neuro','Oncology','Transplant'], distance: 3.2, rating: 4.7, beds: { general: { available: 120 }, icu: { available: 25 } }, traumaSupport: true, waitTime: 10, open24x7: true },
    { _id: 'pn2', name: 'Ruby Hall Clinic', address: 'Sassoon Road, Pune 411001', phone: '+91 20 6645 5100', lat: 18.5292, lng: 73.8746, specialties: ['Cardiology','Nephrology','Oncology','Orthopedics'], distance: 2.8, rating: 4.6, beds: { general: { available: 100 }, icu: { available: 20 } }, traumaSupport: true, waitTime: 12, open24x7: true },
    { _id: 'pn3', name: 'Jehangir Hospital', address: 'Sassoon Road, Pune 411001', phone: '+91 20 6681 5555', lat: 18.5308, lng: 73.8754, specialties: ['Emergency','Surgery','Medicine','Pediatrics'], distance: 2.6, rating: 4.5, beds: { general: { available: 80 }, icu: { available: 18 } }, traumaSupport: true, waitTime: 8, open24x7: true },
    { _id: 'pn4', name: 'KEM Hospital Pune', address: 'Sardar Moodliar Road, Pune 411011', phone: '+91 20 2612 6000', lat: 18.5035, lng: 73.8568, specialties: ['General Medicine','Surgery','Orthopedics','ENT'], distance: 4.1, rating: 4.3, beds: { general: { available: 150 }, icu: { available: 22 } }, traumaSupport: true, waitTime: 15, open24x7: true },
    { _id: 'pn5', name: 'Deenanath Mangeshkar Hospital', address: 'Erandwane, Pune 411004', phone: '+91 20 4015 1000', lat: 18.5107, lng: 73.8325, specialties: ['Cardiac','Neuro','Gastro','Pulmonology'], distance: 3.8, rating: 4.5, beds: { general: { available: 90 }, icu: { available: 16 } }, traumaSupport: true, waitTime: 10, open24x7: true },
    { _id: 'pn6', name: 'Sassoon General Hospital', address: 'Sassoon Road, Pune 411001', phone: '+91 20 2612 0344', lat: 18.5285, lng: 73.8735, specialties: ['General Medicine','Surgery','Trauma','Burn Unit'], distance: 2.5, rating: 3.9, beds: { general: { available: 200 }, icu: { available: 30 } }, traumaSupport: true, waitTime: 25, open24x7: true },
  ],
  mumbai: [
    { _id: 'mb1', name: 'Lilavati Hospital', address: 'Bandra Reclamation, Mumbai 400050', phone: '+91 22 2675 1000', lat: 19.0509, lng: 72.8294, specialties: ['Cardiac','Neuro','Oncology','Transplant','Orthopedics'], distance: 5.2, rating: 4.7, beds: { general: { available: 200 }, icu: { available: 40 } }, traumaSupport: true, waitTime: 15, open24x7: true },
    { _id: 'mb2', name: 'Kokilaben Dhirubhai Ambani Hospital', address: 'Andheri West, Mumbai 400053', phone: '+91 22 3069 6969', lat: 19.1309, lng: 72.8265, specialties: ['Cardiac','Neuro','Robotic Surgery','Oncology'], distance: 8.1, rating: 4.8, beds: { general: { available: 250 }, icu: { available: 50 } }, traumaSupport: true, waitTime: 12, open24x7: true },
    { _id: 'mb3', name: 'Hinduja Hospital', address: 'Mahim, Mumbai 400016', phone: '+91 22 2445 1515', lat: 19.0411, lng: 72.8403, specialties: ['Nephrology','Cardiology','Gastro','Orthopedics'], distance: 4.5, rating: 4.6, beds: { general: { available: 150 }, icu: { available: 30 } }, traumaSupport: true, waitTime: 10, open24x7: true },
    { _id: 'mb4', name: 'KEM Hospital Mumbai', address: 'Parel, Mumbai 400012', phone: '+91 22 2413 6051', lat: 19.0003, lng: 72.8414, specialties: ['Trauma','General Medicine','Surgery','Burns'], distance: 3.2, rating: 4.2, beds: { general: { available: 300 }, icu: { available: 45 } }, traumaSupport: true, waitTime: 30, open24x7: true },
    { _id: 'mb5', name: 'Breach Candy Hospital', address: 'Bhulabhai Desai Road, Mumbai 400026', phone: '+91 22 2366 7788', lat: 18.9718, lng: 72.8054, specialties: ['Cardiology','Surgery','Medicine','Pediatrics'], distance: 6.0, rating: 4.5, beds: { general: { available: 100 }, icu: { available: 20 } }, traumaSupport: false, waitTime: 8, open24x7: true },
  ],
  nagpur: [
    { _id: 'ng1', name: 'AIIMS Nagpur', address: 'Plot No 2, Sector 20, Nagpur 441108', phone: '+91 712 229 6600', lat: 21.0942, lng: 79.0426, specialties: ['All Specialties','Trauma','Cardiac','Neuro','Oncology'], distance: 8.5, rating: 4.8, beds: { general: { available: 300 }, icu: { available: 50 } }, traumaSupport: true, waitTime: 20, open24x7: true },
    { _id: 'ng2', name: 'Orange City Hospital', address: 'Veer Savarkar Square, Nagpur 440009', phone: '+91 712 253 3300', lat: 21.1466, lng: 79.0753, specialties: ['Cardiac','Neuro','Gastro','Orthopedics'], distance: 3.2, rating: 4.5, beds: { general: { available: 120 }, icu: { available: 20 } }, traumaSupport: true, waitTime: 10, open24x7: true },
    { _id: 'ng3', name: 'Wockhardt Hospital Nagpur', address: 'North Ambazari Road, Nagpur 440010', phone: '+91 712 666 3000', lat: 21.1355, lng: 79.0589, specialties: ['Cardiology','Orthopedics','Nephrology','Urology'], distance: 4.1, rating: 4.4, beds: { general: { available: 80 }, icu: { available: 15 } }, traumaSupport: true, waitTime: 8, open24x7: true },
    { _id: 'ng4', name: 'Government Medical College Nagpur', address: 'Hanuman Nagar, Nagpur 440003', phone: '+91 712 274 4437', lat: 21.1508, lng: 79.0845, specialties: ['General Medicine','Surgery','Trauma','Pediatrics'], distance: 2.8, rating: 4.0, beds: { general: { available: 250 }, icu: { available: 35 } }, traumaSupport: true, waitTime: 25, open24x7: true },
  ],
  nashik: [
    { _id: 'nk1', name: 'Wockhardt Hospital Nashik', address: 'Mumbai-Agra Highway, Nashik 422001', phone: '+91 253 660 3000', lat: 19.9975, lng: 73.7898, specialties: ['Cardiac','Orthopedics','Nephrology','Gastro'], distance: 3.5, rating: 4.5, beds: { general: { available: 80 }, icu: { available: 15 } }, traumaSupport: true, waitTime: 10, open24x7: true },
    { _id: 'nk2', name: 'Civil Hospital Nashik', address: 'Jail Road, Nashik 422001', phone: '+91 253 257 2565', lat: 20.0063, lng: 73.7856, specialties: ['General Medicine','Surgery','Trauma','Pediatrics'], distance: 2.0, rating: 3.9, beds: { general: { available: 150 }, icu: { available: 20 } }, traumaSupport: true, waitTime: 20, open24x7: true },
    { _id: 'nk3', name: 'Bytco Hospital', address: 'College Road, Nashik 422005', phone: '+91 253 231 5252', lat: 20.0012, lng: 73.7791, specialties: ['Orthopedics','General Medicine','Surgery'], distance: 2.8, rating: 4.2, beds: { general: { available: 60 }, icu: { available: 10 } }, traumaSupport: false, waitTime: 12, open24x7: true },
  ],
  aurangabad: [
    { _id: 'ab1', name: 'MGM Hospital Aurangabad', address: 'N-6, CIDCO, Aurangabad 431003', phone: '+91 240 248 2682', lat: 19.8765, lng: 75.3425, specialties: ['Cardiac','Neuro','Oncology','Trauma','Orthopedics'], distance: 4.5, rating: 4.5, beds: { general: { available: 100 }, icu: { available: 20 } }, traumaSupport: true, waitTime: 12, open24x7: true },
    { _id: 'ab2', name: 'Government Medical College Aurangabad', address: 'Panchakki Road, Aurangabad 431001', phone: '+91 240 240 2012', lat: 19.8861, lng: 75.3219, specialties: ['General Medicine','Surgery','Trauma','Pediatrics'], distance: 2.2, rating: 4.0, beds: { general: { available: 200 }, icu: { available: 30 } }, traumaSupport: true, waitTime: 25, open24x7: true },
    { _id: 'ab3', name: 'United Ciigma Hospital', address: 'Jalna Road, Aurangabad 431001', phone: '+91 240 233 4455', lat: 19.8722, lng: 75.3398, specialties: ['Cardiology','Nephrology','Gastro','Pulmonology'], distance: 3.8, rating: 4.4, beds: { general: { available: 80 }, icu: { available: 15 } }, traumaSupport: true, waitTime: 10, open24x7: true },
  ],
  kolhapur: [
    { _id: 'kp1', name: 'CPR Hospital Kolhapur', address: 'Tarabai Park, Kolhapur 416003', phone: '+91 231 265 5300', lat: 16.7050, lng: 74.2433, specialties: ['Cardiac','Neuro','Gastro','Orthopedics'], distance: 2.5, rating: 4.5, beds: { general: { available: 80 }, icu: { available: 15 } }, traumaSupport: true, waitTime: 8, open24x7: true },
    { _id: 'kp2', name: 'Chhatrapati Pramila Raje Hospital', address: 'Rajarampuri, Kolhapur 416008', phone: '+91 231 252 5252', lat: 16.6920, lng: 74.2316, specialties: ['General Medicine','Surgery','Pediatrics','Gynecology'], distance: 3.5, rating: 4.2, beds: { general: { available: 100 }, icu: { available: 18 } }, traumaSupport: true, waitTime: 15, open24x7: true },
  ],
  solapur: [
    { _id: 'sp1', name: 'Ashwini Sahakari Rugnalaya', address: 'Solapur 413001', phone: '+91 217 272 5555', lat: 17.6599, lng: 75.9064, specialties: ['Cardiac','Neuro','Orthopedics','General Surgery'], distance: 2.8, rating: 4.3, beds: { general: { available: 60 }, icu: { available: 10 } }, traumaSupport: true, waitTime: 10, open24x7: true },
    { _id: 'sp2', name: 'Civil Hospital Solapur', address: 'Majrewadi, Solapur 413001', phone: '+91 217 272 2012', lat: 17.6550, lng: 75.9100, specialties: ['General Medicine','Surgery','Trauma','Pediatrics'], distance: 2.0, rating: 3.8, beds: { general: { available: 120 }, icu: { available: 15 } }, traumaSupport: true, waitTime: 20, open24x7: true },
  ],
};

// City center coordinates for map centering
export const CITY_CENTERS = {
  jalgaon: { lat: 21.0077, lng: 75.5626, label: 'Jalgaon' },
  pune: { lat: 18.5204, lng: 73.8567, label: 'Pune' },
  mumbai: { lat: 19.0760, lng: 72.8777, label: 'Mumbai' },
  nagpur: { lat: 21.1458, lng: 79.0882, label: 'Nagpur' },
  nashik: { lat: 19.9975, lng: 73.7898, label: 'Nashik' },
  aurangabad: { lat: 19.8762, lng: 75.3433, label: 'Aurangabad' },
  kolhapur: { lat: 16.7050, lng: 74.2433, label: 'Kolhapur' },
  solapur: { lat: 17.6599, lng: 75.9064, label: 'Solapur' },
};

/**
 * Hospital Recommendation Engine
 * Scores hospitals based on proximity, specialty match, bed availability, rating, and wait time
 */
export function recommendHospitals(hospitals, { emergency = '', userLat, userLng } = {}) {
  const emergencyKeywords = emergency.toLowerCase().split(/\s+/);

  return hospitals
    .map(h => {
      let score = 0;

      // Distance score (closer = better, max 30 pts)
      if (h.distance) score += Math.max(0, 30 - h.distance * 3);

      // ICU availability score (max 25 pts)
      const icuAvail = h.beds?.icu?.available || 0;
      score += Math.min(25, icuAvail * 2.5);

      // Rating score (max 20 pts)
      score += (h.rating || 0) * 4;

      // Wait time score (lower = better, max 15 pts)
      score += Math.max(0, 15 - (h.waitTime || 0) * 0.75);

      // Specialty match score (max 10 pts)
      if (emergency && h.specialties) {
        const matchCount = h.specialties.filter(s =>
          emergencyKeywords.some(k => s.toLowerCase().includes(k))
        ).length;
        score += Math.min(10, matchCount * 5);
      }

      // Trauma support bonus
      if (h.traumaSupport) score += 5;

      // 24x7 bonus
      if (h.open24x7) score += 3;

      return { ...h, score: Math.round(score) };
    })
    .sort((a, b) => b.score - a.score);
}

export function getAllCityNames() {
  return Object.keys(MAHARASHTRA_HOSPITALS).map(key => CITY_CENTERS[key]?.label || key);
}

export function searchHospitalsByCity(query) {
  const q = query.toLowerCase().trim();
  const cityKey = Object.keys(CITY_CENTERS).find(k =>
    k.includes(q) || CITY_CENTERS[k].label.toLowerCase().includes(q)
  );
  if (cityKey) return { city: cityKey, hospitals: MAHARASHTRA_HOSPITALS[cityKey] || [] };
  // Search across all cities
  const allHospitals = Object.values(MAHARASHTRA_HOSPITALS).flat();
  const filtered = allHospitals.filter(h => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q));
  return { city: null, hospitals: filtered };
}
