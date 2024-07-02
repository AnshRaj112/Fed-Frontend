import React from 'react';
import Embed from './Embed';
import linkedinlogo from '../../assets/images/SocialMedia/linkedinLogo.svg';
import instalogo from '../../assets/images/SocialMedia/instaLogo.svg';
import styles from './styles/Social.module.scss';

const SocialMedia = () => {
  return (
    <div className={styles.socialMcontainer}>
      <div className={styles.text}>
        <div className={styles.circleCenter}></div>
        <p className={styles.content}>
          Welcome to the social media page of <br />
          <div className={styles.fed}>
            <div className={styles.box} id={styles.box1}>
              <img className={styles.instalogo} src={instalogo} alt="Instagram Logo" /> FED <img className={styles.linkedinlogo} src={linkedinlogo} alt="LinkedIn Logo" />
            </div>
          </div>
          <br />
        </p>
      </div>

      <div className={styles.socialMedia}>
        <div className={styles.container}>
          <div className={styles.leftColumn}>
            <div className={styles.sidebyside}>
              <div className={styles.instagramfeed}>
                <Embed type="instagramTopPost" />
              </div>
              <div className={styles.instagramfeed2}>
                <Embed type="instagramBottomPost" />
                <div className={styles.circle}></div>
              </div>
            </div>
          </div>
          <div className={styles.centerColumn}>
            <div className={styles.instagramreel}>
              <Embed type="instagramReel" />
            </div>
          </div>
          <div className={styles.rightColumn}>
            <div className={styles.linkedinfeed}>
              <div className={styles.circle1}></div>
              <Embed type="linkedInPost" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMedia;
