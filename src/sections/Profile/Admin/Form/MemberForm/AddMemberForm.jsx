import React, { useState, useEffect, useContext,useRef } from "react";
import axios from "axios";
import styles from "./styles/AddMemberForm.module.scss";
import { Button, Input } from "../../../../../components";
import AccessTypes from "../../../../../data/Access.json";
import AuthContext from "../../../../../context/AuthContext";
import { api } from "../../../../../services";
import { EditImage } from "../../../../../features";
// import {api} from "../../../../../services"

function AddMemberForm() {
  const authCtx = useContext(AuthContext);
  const [data, setData] = useState({
    name: "",
    email: "",
    access: "",
    img: "",
    linkedin: "",
    github: "",
    title: "",
    know: ""
  });
  const [selectedFileName,setFileName]=useState(null);
  const [croppedImageFile,setCroppedFile]=useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePrv, setImagePrv] = useState(null);
  const imgRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (authCtx.memberData) {

      setData({
        name: authCtx.memberData.name || "",
        email: authCtx.memberData.email || "",
        access: authCtx.memberData.access || "",
        img: authCtx.memberData.img || "",
        linkedin: authCtx.memberData?.extra?.linkedin || "",
        github: authCtx.memberData?.extra?.github || "",
        title: authCtx.memberData?.extra?.title || "",
        know: authCtx.memberData?.extra?.know || ""
      });
    }
  }, [authCtx.memberData]);

  useEffect(()=>{
    if(authCtx.croppedImageFile){
      // setSelectedFile(authCtx.croppedImageFile);
      const file = authCtx.croppedImageFile;
      setCroppedFile(authCtx.croppedImageFile);
      setData({ ...data, img: file.name });
    }
  },[authCtx.croppedImageFile])

  const [accessTypes, setAccessTypes] = useState([]);

  useEffect(() => {
    fetchAccessTypes();
  }, []);

  const fetchAccessTypes = async () => {
    try {
      const response = await api.get("/api/user/fetchAccessTypes"); // Uncomment and use actual API
      const fetchedAccessTypes = response.data.data;
      setAccessTypes(fetchedAccessTypes);
      // setAccessTypes(AccessTypes.data);
    } catch (error) {
      console.error("Error fetching access types:", error);
      setAccessTypes(AccessTypes.data);
    }
  };

  const isFormFilled = () => {
    const { name, email, access } = data;
    return email.trim() !== "" && access.trim() !== "";
  };

  const filterData = (data) => {
    const filteredData = {};
    const extra = {};

    // Extract and add fields to `extra` if they are present and not empty
    if (data.title.trim() !== "") {
      extra.title = data.title;
    }
    if (data.github.trim() !== "") {
      extra.github = data.github;
    }
    if (data.linkedin.trim() !== "") {
      extra.linkedin = data.linkedin;
    }
    if (data.know.trim() !== "") {
      extra.know = data.know;
    }

    // Add `extra` to `filteredData` if it's not empty
    if (Object.keys(extra).length > 0) {
      filteredData.extra = extra;
    }

    // Add other fields to `filteredData` if they are present and not empty
    Object.keys(data).forEach((key) => {
      if (key !== "title" && key !== "github" && key !== "linkedin" && key !== "know" && data[key].trim() !== "") {
        filteredData[key] = data[key];
      }
    });

    return filteredData;
  };

  const onAddOrUpdateMember = async () => {
    if (isFormFilled()) {
      try {
        // setLoading(true);
        const filteredData = filterData(data);
        const formData = new FormData();
  
       
        for (const key in filteredData) {
          if (key !== "img") {
            formData.append(key, filteredData[key]);
          }
        }
  
      
        if (croppedImageFile) {
          formData.append("image", croppedImageFile);
        }
  
        console.log("Member Data", filteredData);
        const response = await api.post("/api/user/addMember", formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log("Member added successfully:", response.data.user);
        setData({
          name: "",
          email: "",
          access: "",
          img: "",
          linkedin: "",
          github: "",
          title: "",
          know: ""
        });
        alert("Member Added Successfully");
      } catch (error) {
        console.error("Error adding member:", error);
        alert("Failed to add member. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please fill all the fields");
    }
  };
  

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePrv(reader.result); 
      };
      reader.readAsDataURL(file);
      setSelectedFile(file);
      console.log("File in addmember comp:",croppedImageFile);
      setData({ ...data, img: file.name });
      setFileName(file.name);
      setOpenModal(true);
    }
  };


  const closeModal = () => {
    setSelectedFile(null);
    setOpenModal(false);
  };


  const updateImagePreview = (url) => {
    setImagePrv(url);
    // selectedFile(imageFile);
  }
  

  return (
    <div className={styles.main}>
      <div className={styles.formHead}>
        <Input
          placeholder="Name"
          type="text"
          label="Enter Member Name"
          className={styles.memberInput}
          containerStyle={{ width: "100%" }}
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
        />
        <Input
          placeholder="Enter Member Email"
          type="text"
          label="Email"
          className={styles.memberInput}
          containerStyle={{ width: "100%" }}
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
        />
      </div>
      <div className={styles.formHead}>
        <Input
          placeholder="Select Access"
          type="select"
          label="Access"
          options={accessTypes.map((type) => ({ value: type, label: type }))}
          className={styles.memberInput}
          containerStyle={{ width: "100%" }}
          value={data.access}
          onChange={(value) => setData({ ...data, access: value })}
        />
           <div className={styles.imageInputContainer}>
          {selectedFile && (
            <EditImage
              selectedFile={selectedFile}
              setFile={setCroppedFile}
              closeModal={closeModal}
              setimgprv={updateImagePreview} // Pass the updated function
              fileName = {selectedFileName}
              // setImgFile={setCroppedFile}
            />
          )}

{imagePrv &&
          <div className={styles.imagePreview}>
             <img src={imagePrv} alt="Preview" className={styles.image} />
          </div>
        }
          <Input
            placeholder="Enter Member Image File"
            style={{"cursor":"pointer"}}
            onClick={(e) => {
              e.stopPropagation();
              imgRef.current?.click();
            }}
            type="text"
            label="Image"
            className={styles.memberInput}
            containerStyle={{ width: imagePrv?"90%":"100%" }}
            value={data.img}
            onChange={(e) => setData({ ...data, img: croppedImageFile })}
          />
          <input
            style={{ display: "none" }}
            type="file"
            ref={imgRef}
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className={styles.formHead}>
        <Input
          placeholder="Enter Member LinkedIn Link"
          type="text"
          label="LinkedIn"
          className={styles.memberInput}
          value={data.linkedin}
          onChange={(e) => setData({ ...data, linkedin: e.target.value })}
          containerStyle={{ width: "100%" }}
        />
        <Input
          placeholder="Enter Member Github Link"
          type="text"
          label="Github"
          value={data.github}
          onChange={(e) => setData({ ...data, github: e.target.value })}
          className={styles.memberInput}
          containerStyle={{ width: "100%" }}
        />
      </div>
      <div className={styles.formHead}>
        <Input
          placeholder="Enter Title"
          type="text"
          label="Title"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          className={styles.memberInput}
          containerStyle={{ width: "100%" }}
        />
        <Input
          placeholder="Enter Know"
          type="text"
          label="Know"
          value={data.know}
          onChange={(e) => setData({ ...data, know: e.target.value })}
          className={styles.memberInput}
          containerStyle={{ width: "100%" }}
        />
      </div>
      <div className={styles.formHead}>
        <Button onClick={onAddOrUpdateMember}>
          {authCtx.memberData ? "Update Member" : "Add Member"}
        </Button>
      </div>
    </div>
  );
}

export default AddMemberForm;
