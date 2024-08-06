import { useEffect, useState } from "react";
import { SocialEmbed } from "../../components";
import linkedinlogo from "../../assets/images/SocialMedia/linkedinLogo.svg";
import instalogo from "../../assets/images/SocialMedia/instaLogo.svg";
import styles from "./styles/Social.module.scss";
import { ComponentLoading } from "../../microInteraction";

const Social = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  setTimeout(() => {
    setIsLoading(false);
  }, 3000);

  return (
    <div className={styles.socialMcontainer}>
      <div className={styles.text}>
        <div className={styles.circleCenter}></div>
        <p className={styles.content}>
          Welcome to the social media page of <br />
          <div className={styles.fed}>
            <div className={styles.box} id={styles.box1}>
              <img
                className={styles.instalogo}
                src={instalogo}
                alt="Instagram Logo"
              />
              <span
                style={{
                  background: "var(--primary)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                {" "}
                FED{" "}
              </span>
              <img
                className={styles.linkedinlogo}
                src={linkedinlogo}
                alt="LinkedIn Logo"
              />
            </div>
          </div>
          <br />
        </p>
      </div>

      {isLoading ? (
        <ComponentLoading
          customStyles={{
            width: "100%",
            height: "100%",
            display: "flex",
            marginTop:"-3rem",
            marginBottom:"4rem",
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      ) : (
        <div className={styles.socialMedia}>
          <div className={styles.container}>
            <div className={styles.leftColumn}>
              <div className={styles.sidebyside}>
                <div className={styles.instagramfeed}>
                  <SocialEmbed type="instagramTopPost" />
                </div>
                <div className={styles.instagramfeed2}>
                  <SocialEmbed type="instagramBottomPost" />
                  <div className={styles.circle}></div>
                </div>
              </div>
            </div>
            <div className={styles.centerColumn}>
              <div className={styles.instagramreel}>
                <SocialEmbed type="instagramReel" />
              </div>
            </div>
            <div className={styles.rightColumn}>
              <div className={styles.linkedinfeed}>
                <div className={styles.circle1}></div>
                <SocialEmbed type="linkedInPost" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
