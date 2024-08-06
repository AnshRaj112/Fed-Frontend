import { useContext, useState } from "react";
import styles from "./style/Signup.module.scss";
import { Input, Button, Text } from "../../components";
import GoogleSignup from "./GoogleSignup";
import bcrypt from "bcryptjs";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OtpInputModal from "../../features/Modals/authentication/OtpInputModal";
import { Alert, MicroLoading } from "../../microInteraction";
import { RecoveryContext } from "../../context/RecoveryContext";
import { api } from "../../services";
import AuthContext from "../../context/AuthContext";
// import { validateData } from "../../utils/hooks/validation/validateSignupData";

const SignUp = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [userObject, setUserObject] = useState({});
  const { setEmail } = useContext(RecoveryContext);
  const [OTP, setOTP] = useState("");
  const [isTandChecked, setTandC] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [navigatePath, setNavigatePath] = useState("/");
  const [showDropdown, setShowDropdown] = useState(false);
  const authCtx = useContext(AuthContext);

  const [showUser, setUser] = useState({
    email: "",
    Password: "",
    FirstName: "",
    LastName: "",
    rollNumber: "",
    school: "",
    college: "",
    contactNo: "+91",
    year: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (alert) {
      const { type, message, position, duration } = alert;
      Alert({ type, message, position, duration });
      setAlert(null); // Reset alert after displaying it
    }
  }, [alert]);

  useEffect(() => {
    if (shouldNavigate) {
      navigate(navigatePath);
      setShouldNavigate(false); // Reset state after navigation
    }
  }, [shouldNavigate, navigatePath, navigate]);

  const DataInp = (name, value) => {
    if (name === "college" && value.toLowerCase().startsWith("k")) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
    setUser({ ...showUser, [name]: value });
  };

  const handleSelectCollege = () => {
    setUser({
      ...showUser,
      college: "Kalinga Institute of Industrial Technology",
    });
    setShowDropdown(false);
  };

  const validateData = (data, isTandChecked) => {
    const errors = [];

    if (!data.FirstName) {
      errors.push("First Name is required.");
    }

    if (!data.LastName) {
      errors.push("Last Name is required.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push("Enter a valid email address.");
    }

    if (data.contactNo.length < 10 || data.contactNo.length > 12) {
      errors.push("Contact Number must be between 10 and 12 digits.");
    }

    if (!data.college) {
      errors.push("College is required.");
    }

    if (!data.school) {
      errors.push("School is required.");
    }

    if (!data.rollNumber) {
      errors.push("Roll Number is required.");
    }

    if (!data.year) {
      errors.push("Year is required.");
    }

    if (!data.Password) {
      errors.push("Password is required.");
    }

    if (!isTandChecked) {
      errors.push("Please check the terms and conditions.");
    }

    return errors;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const validationResult = validateData(showUser, isTandChecked);

    if (validationResult.length > 0) {
      setAlert({
        type: "error",
        message: validationResult.join(" "),
        position: "bottom-right",
        duration: 3000,
      });
      setIsLoading(false);
      return;
    }

    const {
      email,
      Password,
      FirstName,
      LastName,
      rollNumber,
      school,
      college,
      contactNo,
      year,
    } = showUser;

    const name = FirstName + " " + LastName;
    const password = bcrypt.hashSync(Password, import.meta.env.VITE_BCRYPT);
    const user = {
      name,
      email,
      password,
      rollNumber,
      school,
      college,
      contactNo,
      year,
    };

    setUserObject(user);

    try {
      setAlert({
        type: "info",
        message: "Generating Verification OTP. Wait a moment...",
        position: "bottom-right",
        duration: 3000,
      });

      setTimeout(() => {
        setShowModal(true);
      }, 3000);

      const response = await api.post(
        "/api/auth/verifyEmail",
        { email: user.email },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        setAlert({
          type: "success",
          message: response.data.message || "Otp Sent to Email",
          position: "bottom-right",
          duration: 3000,
        });
      } else {
        setAlert({
          type: "error",
          message: response.data.message || "Error in sending OTP",
          position: "bottom-right",
          duration: 3000,
        });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error?.response?.data?.message ||
          "Failed to send OTP. Please try again.",
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (enteredOTP) => {
    if (enteredOTP) {
      try {
        const response = await api.post("/api/auth/register", {
          ...userObject,
          otp: enteredOTP,
        });

        if (response.status == 200 || response.status == 201) {
          // setLoad(false);
          console.log(response);
          authCtx.login(
            response.data.user.name,
            response.data.user.email,
            response.data.user.img,
            response.data.user.rollNumber,
            response.data.user.school,
            response.data.user.college,
            response.data.user.contactNo,
            response.data.user.year,
            response.data.user.extra?.github,
            response.data.user.extra?.linkedin,
            response.data.user.extra?.designation,
            response.data.user.regForm,
            response.data.user.access,
            response.data.user.editProfileCount,
            response.data.user.blurhash,
            response.data.token,
            10800000
          );
          console.log(authCtx);
          navigate("/");
        }
      } catch (error) {
        setAlert({
          type: "error",
          message: error?.response?.data?.message || "Enter valid Details",
          position: "bottom-right",
          duration: 3000,
        });
      }

      // Handle successful verification
    } else {
      console.log("Enter valid Otp");
    }
  };
  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleCheckBox = () => {
    setTandC((prevState) => !prevState);
  };

  // console.log(alert)

  return (
    <>
      <div style={{ width: "100vw" }}>
        <Link to={"/"}>
          <div className={styles.ArrowBackIcon}>
            <ArrowBackIcon />
          </div>
        </Link>

        <div className={styles.circle}></div>

        <div className={styles.circle1}></div>
        <div
          className={styles.container}
          style={{
            zIndex: "10",
          }}
        >
          <div className={styles.signin}>
            <h1>
              SignUp
            </h1>
            <GoogleSignup setAlert={setAlert} />
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                margin: "8 px 0 4px 0",
              }}
            >
              <div className={styles.divider} />
              <p style={{ color: "#fff", textAlign: "center" }}>or</p>
              <div className={styles.divider} />
            </div>
            <form onSubmit={handleSignUp}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "48%" }}>
                  <Input
                    type="text"
                    placeholder="First Name"
                    label="First Name"
                    name="FirstName"
                    onChange={(e) => DataInp(e.target.name, e.target.value)}
                    required
                    style={{ width: "96%" }}
                    className={styles.input}
                  />
                </div>
                <div style={{ width: "48%" }}>
                  <Input
                    type="text"
                    placeholder="Last Name"
                    label="Last Name"
                    name="LastName"
                    onChange={(e) => DataInp(e.target.name, e.target.value)}
                    required
                    style={{ width: "96%" }}
                    className={styles.input}
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: "48%" }}>
                  <Input
                    type="email"
                    placeholder="eg.-myemail@gmail.com"
                    label="Email"
                    name="email"
                    className={styles.input}
                    onChange={(e) => DataInp(e.target.name, e.target.value)}
                    required
                    style={{ width: "96%" }}
                  />
                </div>
                <div style={{ width: "48%" }}>
                  <Input
                    type="number"
                    placeholder="1234567890"
                    label="Mobile"
                    name="contactNo"
                    onChange={(e) => DataInp(e.target.name, e.target.value)}
                    required
                    style={{ width: "96%" }}
                    className={styles.input}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "2%",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ width: "46%" }}>
                  <Input
                    type="text"
                    placeholder="College Name"
                    label="college"
                    name="college"
                    className={styles.input}
                    value={showUser.college}
                    onChange={(e) => DataInp(e.target.name, e.target.value)}
                    required
                    style={{ width: "96%" }}
                  />
                  {showDropdown && (
                    <div className={styles.dropdown}>
                      <div
                        className={styles.dropdownItem}
                        onClick={handleSelectCollege}
                      >
                        Kalinga Institute of Industrial Technology
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ width: "48%" }}>
                  <Input
                    type="text"
                    placeholder="School"
                    label="School"
                    name="school"
                    className={styles.input}
                    onChange={(e) => DataInp(e.target.name, e.target.value)}
                    required
                    style={{ width: "96%" }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ width: "46%" }}>
                  <Input
                    type="select"
                    placeholder="Select year"
                    label="Year"
                    name="year"
                    options={[
                      { value: "1st", label: "1st year" },
                      { value: "2nd", label: "2nd year" },
                      { value: "3rd", label: "3rd year" },
                      { value: "4th", label: "4th year" },
                      { value: "5th", label: "5th year" },
                      { value: "Passout", label: "Passout" },
                    ]}
                    value={showUser.year}
                    onChange={(value) => DataInp("year", value)}
                    required
                    style={{ width: "96%" }}
                    className={styles.input}
                  />
                </div>
                <div style={{ width: "48%" }}>
                  <Input
                    type="text"
                    placeholder="Roll Number"
                    label="Roll Number"
                    name="rollNumber"
                    onChange={(e) => DataInp(e.target.name, e.target.value)}
                    required
                    style={{ width: "96%" }}
                    className={styles.input}
                  />
                </div>
              </div>
              <Input
                type="password"
                placeholder="Enter your password"
                label="Password"
                name="Password"
                onChange={(e) => DataInp(e.target.name, e.target.value)}
                required
                style={{ width: "98%" }}
                className={styles.input}
              />

              <div
                style={{
                  display: "flex",
                  marginTop: "15px",
                  marginLeft: "5px",
                }}
              >
                <input
                  type="checkbox"
                  style={{ height: "17px", width: "17px", cursor: "pointer" }}
                  checked={isTandChecked}
                  onClick={handleCheckBox}
                />

                <Text
                  style={{
                    fontSize: "0.7rem",
                    textAlign: "center",
                    marginLeft: "5px",
                    textAlign: "left",
                  }}
                >
                  agree to FED's
                  <Link
                    to="/TermsAndConditions"
                    style={{
                      background: "var(--primary)",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      marginLeft: "7px",
                      marginRight: "7px",
                    }}
                  >
                    Terms and Conditions
                  </Link>
                  And
                  <Link
                    to="/PrivacyPolicy"
                    style={{
                      background: "var(--primary)",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      marginLeft: "7px",
                    }}
                  >
                    FED's Privacy Policy.
                  </Link>
                </Text>
              </div>

              <Button
                type="submit"
                style={{
                  width: "100%",
                  background: "var(--primary)",
                  color: "#fff",
                  height: "40px",
                  marginTop: "20px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  // border: "1px solid #fff",
                }}
                disabled={isLoading}
              >
                {isLoading ? <MicroLoading /> : "Sign Up"}
              </Button>
              <Text
                style={{
                  fontSize: "0.9rem",
                  textAlign: "center",
                  marginTop: "14px",
                }}
              >
                Already Have an account?{" "}
                <Link
                  to="/Login"
                  style={{
                    background: "var(--primary)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Login
                </Link>
              </Text>
            </form>
          </div>
          <div className={styles.sideImage}></div>
        </div>
      </div>

      {showModal && (
        <OtpInputModal
          onVerify={handleVerifyOTP}
          handleClose={handleModalClose}
        />
      )}
      <Alert />
    </>
  );
};

export default SignUp;
