import { useState, useContext, useEffect } from "react";
import styles from "./styles/ProfileView.module.scss";
import AuthContext from "../../../../context/AuthContext";
import { FiEdit } from "react-icons/fi";
import { EditProfile } from "../../../../features";
import { ComponentLoading } from "../../../../microInteraction";
import PropTypes from "prop-types";
import { Alert } from "../../../../microInteraction";

const Profile = ({ editmodal }) => {
  const authCtx = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (alert) {
      const { type, message, position, duration } = alert;
      Alert({ type, message, position, duration });
      setAlert(null); // Reset alert after displaying it
    }
  }, [alert]);

  const handleOpen = () => {
    console.log("editProfileCount", authCtx.user);
    console.log("editProfileCount", authCtx.user.editProfileCount);
    if (authCtx.user.editProfileCount > 0) {
      setIsOpen(true);
    } else {
      setAlert({
        type: "error",
        message: "You have exceeded the limit of editing your profile.",
        position: "bottom-right",
        duration: 3000,

      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const userDetails = [
    { label: "Full Name", value: authCtx.user.name },
    { label: "Email ID", value: authCtx.user.email },
    { label: "Roll Number", value: authCtx.user.rollNumber },
    { label: "Year", value: authCtx.user.year },
    { label: "School", value: authCtx.user.school },
    { label: "College", value: authCtx.user.college },
    { label: "Mobile No", value: authCtx.user.contactNo },
  ];

  const extraDetails = [
    { label: "Github", value: authCtx.user.extra.github },
    { label: "LinkedIn", value: authCtx.user.extra.linkedin },
    { label: "Designation", value: authCtx.user.extra.designation },
  ];

  return (
    <div id={styles.profile}>
      <div className={styles.proHeading}>
        <h3 className={styles.headInnerText}>
          <span>Profile</span> Details
        </h3>
        <div className={styles.editbtn} onClick={handleOpen}>
          <FiEdit />
        </div>
      </div>
      {authCtx.user && (
        isLoading ? (
          <ComponentLoading />
        ) : (
          <div className={styles.details}>
            <table className={styles.profileTable}>
              <tbody>
                {userDetails.map((detail, index) => (
                  <tr key={index}>
                    <td className={styles.dets}>{detail.label}</td>
                    <td className={styles.vals}>{detail.value}</td>
                  </tr>
                ))}
                {authCtx.user.access !== "USER" && extraDetails.map((detail, index) => (
                  (detail.value) ? (
                    <tr key={index}>
                      <td className={styles.dets}>{detail.label}</td>
                      <td className={styles.vals}>{detail.value}</td>
                    </tr>
                  ) : (
                    <tr key={index}>
                      <td className={styles.dets}>{detail.label}</td>
                      <td className={styles.vals}>N/A</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
      {isOpen && (
        <EditProfile handleModalClose={handleClose} />
      )}
      <Alert/>
    </div>
  );
};

Profile.propTypes = {
  editmodal: PropTypes.string.isRequired,
};

export default Profile;
