import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./styles/LiveEventPopup.module.scss";
import { api } from "../../../../services";

const LiveEventPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEventOngoing, setIsEventOngoing] = useState(false);
  const [eventImage, setEventImage] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await api.get("/api/form/getAllForms");
        const fetchedEvents = response.data;

        const currentEvent = fetchedEvents.events.filter(
          (event) =>
            event.info.isEventPast === false &&
            event.info.isPublic === true &&
            event.info.relatedEvent === "null"
        );
        // console.log("currentEvent:", currentEvent);
        if (currentEvent && !sessionStorage.getItem("popupDisplayed")) {
          setIsEventOngoing(true);
          setEventImage(currentEvent[0].info.eventImg);

          const timer = setTimeout(() => {
            setIsVisible(true);
            sessionStorage.setItem("popupDisplayed", "true");
          }, 2500);

          return () => clearTimeout(timer);
        } else {
          setIsEventOngoing(false);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, []);

  useEffect(() => {
    if (isEventOngoing) {
      if (isVisible) {
        document.body.classList.add(styles.lockScroll);
      } else {
        document.body.classList.remove(styles.lockScroll);
      }
    }

    return () => {
      document.body.classList.remove(styles.lockScroll);
    };
  }, [isVisible, isEventOngoing]);

  const closePopup = () => {
    setIsVisible(false);
  };

  // console.log("eventImageurl:",eventImage);

  return (
    <>
      {isEventOngoing && (
        <div className={`${styles.popup} ${isVisible ? styles.fadeIn : ""}`}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={closePopup}>
              ×
            </button>
            <a href="/Events">
              <img src={eventImage} alt="Event" />
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default LiveEventPopup;
