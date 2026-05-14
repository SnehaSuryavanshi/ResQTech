import React from 'react';
import { FaHeartbeat, FaTwitter, FaGithub, FaLinkedin } from 'react-icons/fa';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <FaHeartbeat className="text-primary" />
            <span>ResQAI</span>
          </div>
          <p>AI-Powered Emergency Healthcare Platform. Saving lives with intelligence.</p>
        </div>
        
        <div className={styles.links}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/hospitals">Find Hospital</a></li>
            <li><a href="/map">Emergency Map</a></li>
            <li><a href="/first-aid">First Aid Guide</a></li>
          </ul>
        </div>
        
        <div className={styles.socials}>
          <h4>Connect</h4>
          <div className={styles.socialIcons}>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaGithub /></a>
            <a href="#"><FaLinkedin /></a>
          </div>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} ResQAI. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
