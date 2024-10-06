import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import styles from "./styles/ViewMember.module.scss";
import { Button, TeamCard } from "../../../../../components";
import AddMemberForm from "../../Form/MemberForm/AddMemberForm";
import localTeamMembers from "../../../../../data/Team.json";
import AccessTypes from "../../../../../data/Access.json";
import AuthContext from "../../../../../context/AuthContext";
import { api } from "../../../../../services";
import { Alert, ComponentLoading } from "../../../../../microInteraction";

function ViewMember() {
  const [memberActivePage, setMemberActivePage] = useState("Board");
  const [members, setMembers] = useState([]);
  const [access, setAccess] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const authCtx = useContext(AuthContext);
  const [enablingUpdate, setEnable] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    if (alert) {
      const { type, message, position, duration } = alert;
      Alert({ type, message, position, duration });
    }
  }, [alert]);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/user/fetchTeam");
        const fetchedMembers = response.data.data;
        setMembers(fetchedMembers);
      } catch (error) {
        console.error("Error fetching member data:", error);
        setMembers(localTeamMembers); // Fallback to test data
      } finally {
        setLoading(false);
      }
    };

    const fetchAccessTypes = async () => {
      try {
        const response = await api.get("/api/user/fetchAccessTypes");
        const fetchedAccess = response.data.data;

        const testAccess = [
          "ADMIN",
          "USER",

          "PRESIDENT",
          "VICEPRESIDENT",
          "DIRECTOR_TECHNICAL",
          "DIRECTOR_CREATIVE",
          "DIRECTOR_MARKETING",
          "DIRECTOR_OPERATIONS",
          "DIRECTOR_PR_AND_FINANCE",
          "DIRECTOR_HUMAN_RESOURCE",
          "DEPUTY_DIRECTOR_TECHNICAL",
          "DEPUTY_DIRECTOR_CREATIVE",
          "DEPUTY_DIRECTOR_MARKETING",
          "DEPUTY_DIRECTOR_OPERATIONS",
          "DEPUTY_DIRECTOR_PR_AND_FINANCE",
          "DEPUTY_DIRECTOR_HUMAN_RESOURCE",
          "TECHNICAL",
          "CREATIVE",
          "MARKETING",
          "OPERATIONS",
          "PR_AND_FINANCE",
          "HUMAN_RESOURCE",

          "ALUMNI",
          "EX_MEMBER",
        ];

        const filteredAccess = testAccess.filter(
          (accessType) =>
            !["ADMIN", "USER", "PRESIDENT", "VICEPRESIDENT"].includes(
              accessType
            ) &&
            !accessType.startsWith("DIRECTOR_") &&
            !accessType.startsWith("DEPUTY_")
        ).map((accessType) => {
          return accessType
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        });

        // Adding "Directors" and "Add Member" to the filteredAccess array
        filteredAccess.push("Board", "Add Member");
        setAccess(filteredAccess);
      } catch (error) {
        console.error("Error fetching Access Types:", error);
        setAccess(AccessTypes.data); // Fallback to test data
      }
    };

    fetchAccessTypes();
    fetchMemberData();
  }, []);

  const handleButtonClick = (menu) => {
    if (menu === "add member" && enablingUpdate) {
      authCtx.memberData = null;
      authCtx.croppedImageFile = null;
      setEnable(false);
      setMemberActivePage("");
      setTimeout(() => {
        setMemberActivePage("add member");
      }, 0);
    } else {
      setMemberActivePage(menu);
    }
  };

  const headerMenu = access.map((accessType) => accessType.toLowerCase());

  const renderButtons = () =>
    headerMenu.map((menu) => (
      <Button
        key={menu}
        className={styles.buttonMember}
        variant={
          menu === memberActivePage.toLowerCase() ? "primary" : "secondary"
        }
        onClick={() => {
          handleButtonClick(menu);
        }}
        style={{
          borderRadius: menu !== "add member" ? "20px" : "10px",
          marginLeft: menu === "add member" ? "0px" : "0px",
        }}
      >
        {menu}
      </Button>
    ));

  const getMembersByPage = () => {
    if (memberActivePage.toLowerCase() === "add member" && !enablingUpdate) {
      authCtx.memberData = null;
    }

    let filteredMembers = [];
    if (memberActivePage.toLowerCase() === "board") {
      filteredMembers = members.filter(
        (member) =>
          member.access.startsWith("DIRECTOR_") ||
          member.access.startsWith("DEPUTY_") ||
          member.access === "PRESIDENT" ||
          member.access === "VICEPRESIDENT"
      );
    } else {
      filteredMembers = members.filter((member) => {
        // Convert accessCategory to lowercase for case-insensitive comparison
        const accessCategory = member.access
          .replace(/_/g, " ") // Replace all underscores with spaces
          .toLowerCase();
  
        // Compare with memberActivePage in lowercase
        return accessCategory === memberActivePage.toLowerCase();
      });
    }

    // Apply search query filter
    if (searchQuery) {
      filteredMembers = filteredMembers.filter((member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort filtered members alphabetically
    filteredMembers.sort((a, b) => a.name.localeCompare(b.name));
    return filteredMembers;
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [searchQuery]);

  const customStyles = {
    teamMember: styles.teamMemberCustom,
    teamMemberBackh5: styles.teamMemberBackh5Custom,
    socialLinksa: styles.socialLinksaCustom,
    button: styles.buttonCustom,
    knowPara: styles.knowParaCustom,
    updatebtn: styles.updatebtnCustom,
    teamMemberBack: styles.teamMemberBackCustom,
  };

  const handleUpdate = (member) => {
    setMemberActivePage("Add Member");
    setEnable(true);
  };

  const handleRemove = async () => {
    try {
      const id = authCtx.memberData.id;
      const response = await api.delete(`/api/user/deleteMember/${id}`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        setAlert({
          type: "success",
          message: "Member deleted successfully.",
          position: "bottom-right",
          duration: 3000,
        });
        setMembers((members) =>
          members.filter((m) => m.id !== response.data.user.id)
        );
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const membersToDisplay = getMembersByPage();

  return (
    <div className={styles.mainMember}>
      <div className={styles.eventmember}>
        <div className={styles.right}>
          <div className={styles.buttonContainer}>
            <h3 className={styles.headInnerText}>
              <span>View</span> Member
            </h3>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setLoading(true); // Show loading when searching
                }}
                className={styles.searchInput}
              />
            </div>
          </div>
          <div className={styles.buttons}>{renderButtons()}</div>
          {loading ? (
            <ComponentLoading /> // Show loading component
          ) : memberActivePage.toLowerCase() === "add member" ? (
            <AddMemberForm />
          ) : (
            <div className={styles.teamGrid}>
              {membersToDisplay.map((member, idx) => (
                <TeamCard
                  key={idx}
                  member={member}
                  customStyles={customStyles}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Alert />
    </div>
  );
}

export default ViewMember;
