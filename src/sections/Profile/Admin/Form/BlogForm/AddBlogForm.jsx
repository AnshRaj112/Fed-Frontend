import { useState, useRef, useEffect, useContext } from "react";
import { Button, Input} from "../../../../../components";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa";
import AuthContext from "../../../../../context/AuthContext";
import styles from "./styles/AddBlogForm.module.scss";
import Switch from "react-switch";
import { nanoid } from "nanoid";
import { Alert, MicroLoading } from "../../../../../microInteraction";
import { api } from "../../../../../services";
import BlogCard from "../../../../../components/BlogCard/BlogCard";
import geminiLogo from "../../../../../assets/images/geminiLogo.svg";
import { IoMdAttach } from "react-icons/io";


function NewBlogForm() {
  const scrollRef = useRef(null);
  const [isVisibility, setisVisibility] = useState(false);
  const authCtx = useContext(AuthContext);
  const [alert, setAlert] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setisEditing] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [isAnimating, setIsAnimating] = useState(false);
  const [geminiAnimated, setGeminiAnimated] = useState(false);
  const [autoFillAnimated, setAutoFillAnimated] = useState(false);



  const [data, setdata] = useState({
    _id: nanoid(),
    blogTitle: "",
    blogSubtitle: "",
    metaDescription: "",
    image: "",
    blogDate: new Date().toISOString().split('T')[0],
    blogAuthor: "",
    mediumLink: "",
    blogCategory: "",
    blogTags: [],
    isPublished: false,
    isFeatured: false,
    isCommentEnabled: true,
  });

  const fileInputRef = useRef();

  useEffect(() => {
    if (alert) {
      const { type, message, position, duration } = alert;
      Alert({ type, message, position, duration });
    }
  }, [alert]);

  useEffect(() => {
   // blog mounting fetch
    fetchBlogs();
    
   
    const refreshInterval = setInterval(() => {
      fetchBlogs();
    }, 30000);
    
   
    return () => clearInterval(refreshInterval);
  }, []);

  const isValidImage = (img) => {
    if (img instanceof File) return true;
    if (typeof img === 'string') {
      // Accept if it's a valid URL and looks like an image
      return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)$/i.test(img);
    }
    return false;
  };

  // Add a utility to check if a string is a valid image URL
  const isValidImageUrl = (url) => {
    // Accepts image URLs with extension anywhere in the path or query
    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
  };

  // Update isValidBlog to accept either a valid image URL or a File
  const isValidBlog = () => {
    if (!data.blogTitle) {
      setAlert({
        type: "error",
        message: "Blog title is required.",
        position: "bottom-right",
        duration: 3000,
      });
      return false;
    }

    if (!data.image || !(data.image instanceof File || isValidImageUrl(data.image))) {
      setAlert({
        type: "error",
        message: "Blog featured image is required (upload or valid image link).",
        position: "bottom-right",
        duration: 3000,
      });
      return false;
    }

    if (!data.blogDate) {
      setAlert({
        type: "error",
        message: "Blog publication date is required.",
        position: "bottom-right",
        duration: 3000,
      });
      return false;
    }

    if (!data.blogAuthor) {
      setAlert({
        type: "error",
        message: "Blog author is required.",
        position: "bottom-right",
        duration: 3000,
      });
      return false;
    }

    if (!data.blogCategory) {
      setAlert({
        type: "error",
        message: "Blog department is required.",
        position: "bottom-right",
        duration: 3000,
      });
      return false;
    }

    if (!data.metaDescription) {
      setAlert({
        type: "error",
        message: "Meta description is required.",
        position: "bottom-right",
        duration: 3000,
      });
      return false;
    }

    return true;
  };

  const fetchBlogs = async () => {
    try {
      setLoadingBlogs(true);
      console.log("Fetching blogs...");
      
      const timestamp = new Date().getTime();
      const response = await api.get(`/api/blog/getBlog?t=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      
      if (response.status === 200) {
        console.log("Fetched blogs:", response.data.blogs);
        setBlogs(response.data.blogs || []);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setAlert({
        type: "error",
        message: "Failed to fetch blogs. Please try again.",
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleEditBlog = (blog) => {
    console.log("Edit blog clicked with data:", blog);
    setisEditing(true);
    
    let authorName = "";
    let authorDepartment = "";
    
    try {
      if (typeof blog.author === 'string') {
        console.log("Author is a string:", blog.author);
        try {
          const authorObj = JSON.parse(blog.author);
          console.log("Parsed author object:", authorObj);
          authorName = authorObj.name || "";
          authorDepartment = authorObj.department || "";
        } catch (parseError) {
          console.error("Failed to parse author JSON:", parseError);
          authorName = blog.author;
        }
      } else if (typeof blog.author === 'object' && blog.author !== null) {
        console.log("Author is already an object:", blog.author);
        authorName = blog.author.name || "";
        authorDepartment = blog.author.department || "";
      } else {
        console.log("Author is neither string nor object:", typeof blog.author, blog.author);
        authorName = String(blog.author || "");
      }
    } catch (error) {
      console.error("Error handling author:", error);
      authorName = String(blog.author || "");
    }
    
    console.log("Extracted author name:", authorName);
    console.log("Extracted author department:", authorDepartment);
    
    let formattedDate = new Date().toISOString().split('T')[0];
    if (blog.date) {
      try {
        formattedDate = new Date(blog.date).toISOString().split('T')[0];
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }
    
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    
    if (!blog.id) {
      console.error("Blog ID is missing for edit operation");
      setAlert({
        type: "error",
        message: "Cannot edit blog: Missing blog ID",
        position: "bottom-right",
        duration: 3000,
      });
      return;
    }
    
    console.log("Blog ID for edit operation:", blog.id);
    
    const formData = {
      _id: blog.id, 
      originalBlog: blog, 
      blogTitle: blog.title || "",
      blogSubtitle: blog.subtitle || "",
      metaDescription: blog.desc || blog.summary || "",
      image: blog.image || "",
      blogDate: formattedDate,
      blogAuthor: authorName,
      mediumLink: blog.blogLink || "",
      blogCategory: authorDepartment,
      blogTags: blog.tags || [],
      isPublished: blog.visibility === "public" || false,
      isFeatured: blog.isFeatured || false,
      isCommentEnabled: blog.isCommentEnabled || true,
    };
    
    console.log("Setting form data for edit:", formData);
    setdata(formData);
    
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDeleteBlog = async (blogId) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    
    try {
      setIsLoading(true);
      const response = await api.delete(`/api/blog/deleteBlog/${blogId}`, {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      });

      if (response.status === 200) {
        setAlert({
          type: "success",
          message: "Blog deleted successfully",
          position: "bottom-right",
          duration: 3000,
        });
        fetchBlogs();
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      setAlert({
        type: "error",
        message: error.response?.data?.message || "Failed to delete blog. Please try again.",
        position: "bottom-right",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewBlog = (blogLink) => {
    if (blogLink) {
      window.open(blogLink, '_blank');
    } else {
      setAlert({
        type: "warning",
        message: "Blog link not available",
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  const onSaveBlog = async () => {
    if (isValidBlog()) {
      setIsLoading(true);
      const form = new FormData();
      // Always append the image field if present
      if (data.image instanceof File) {
        form.append("image", data.image);
      } else if (typeof data.image === "string" && data.image.startsWith("http")) {
        form.append("image", data.image);
      }
    
      if (!isEditing) {
       
        form.append('title', data.blogTitle);
        
      
        try {
          if (typeof data.blogAuthor === 'string' && data.blogAuthor.startsWith('{')) {
           
            form.append('author', data.blogAuthor);
          } else {
           
            const authorObj = {
              name: data.blogAuthor,
              department: data.blogCategory || 'General'
            };
            form.append('author', JSON.stringify(authorObj));
          }
        } catch (e) {
          console.error("Error handling author data:", e);
          const authorObj = {
            name: data.blogAuthor,
            department: data.blogCategory || 'General'
          };
          form.append('author', JSON.stringify(authorObj));
        }
        
        form.append('blogLink', data.mediumLink);
        form.append('desc', data.metaDescription);
        form.append('date', data.blogDate);
        form.append('summary', data.metaDescription || "");
        
        // visibility handling based on toggle
        form.append('visibility', data.isPublished ? 'public' : 'private');
        
        const approvalObj = {
          status: true,
          approvedBy: 'System'
        };
        form.append('approval', JSON.stringify(approvalObj));
      }
      
      console.log("Form data being prepared:");
      for (let [key, value] of form.entries()) {
        console.log(key, value);
      }
      
      try {
        let response;
        
        if (isEditing) {
          // used put method for updating blogs
          console.log(`Updating blog with ID: ${data._id}`);
          
          if (!data._id) {
            throw new Error("Missing blog ID for update operation");
          }
          
          const formEntries = Array.from(form.entries());
          for (const [key] of formEntries) {
            form.delete(key);
          }
          
          form.append('title', data.blogTitle);
          
          const authorObj = {
            name: data.blogAuthor,
            department: data.blogCategory || 'General'
          };
          form.append('author', JSON.stringify(authorObj));
          
          form.append('blogLink', data.mediumLink);
          form.append('desc', data.metaDescription);
          form.append('date', data.blogDate);
          form.append('summary', data.metaDescription || "");
          form.append('visibility', data.isPublished ? 'public' : 'private');
          form.append('category', data.blogCategory || 'General');
          
          const approvalObj = {
            status: true,
            approvedBy: 'System'
          };
          form.append('approval', JSON.stringify(approvalObj));
          
          // After deleting all fields, always append the image field if present
          if (data.image instanceof File) {
            form.append("image", data.image);
          } else if (typeof data.image === "string" && data.image.startsWith("http")) {
            form.append("image", data.image);
          }
          
          console.log("Final update form data:", Object.fromEntries(form.entries()));
          console.log("Updating blog with ID:", data._id);
          
          try {
            const blogId = data._id;
            
            if (!blogId) {
              throw new Error("Missing blog ID for update operation");
            }
            
            console.log(`Making API call to update blog with ID: ${blogId}`);
            console.log("Form data being sent:", Object.fromEntries(form.entries()));
            
            response = await api.put(
              `/api/blog/updateBlog/${blogId}`,
              form,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${window.localStorage.getItem("token")}`,
                },
              }
            );
            
            console.log("Update response:", response.data);
            
            if (response.status !== 200) {
              throw new Error(`Server responded with status ${response.status}: ${response.statusText}`);
            }
          } catch (updateError) {
            console.error("Error updating blog:", updateError);
            throw new Error(updateError.response?.data?.message || "Failed to update blog");
          }
          
          console.log("Update response:", response.data);
        } else {
          response = await api.post(
            "/api/blog/createBlog",
            form,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${window.localStorage.getItem("token")}`,
              },
            }
          );
        }

        if (response.status === 200 || response.status === 201) {
          setisEditing(false);
          setdata({
            _id: nanoid(),
            blogTitle: "",
            blogSubtitle: "",
            blogContent: "",
            image: "",
            blogDate: new Date().toISOString().split('T')[0],
            blogAuthor: "",
            mediumLink: "",
            blogCategory: "",
            blogTags: [],
            metaDescription: "",
            isPublished: false,
            isFeatured: false,
            isCommentEnabled: true,
          });
          
          setTimeout(async () => {
            try {
              const fetchWithTimestamp = async () => {
                const timestamp = new Date().getTime();
                console.log(`Fetching blogs with timestamp: ${timestamp}`);
                const response = await api.get(`/api/blog/getBlog?t=${timestamp}`, {
                  headers: {
                    Authorization: `Bearer ${window.localStorage.getItem("token")}`,
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                  },
                });
                
                if (response.status === 200) {
                  console.log("Freshly fetched blogs:", response.data.blogs);
                  setBlogs(response.data.blogs || []);
                }
              };
              
              // First fetch
              await fetchWithTimestamp();
              
              setAlert({
                type: "success",
                message: isEditing ? "Blog updated successfully" : "Blog saved successfully",
                position: "bottom-right",
                duration: 3000,
              });
              
              if (isEditing) {
                console.log('Dispatching blog-updated event');
                window.dispatchEvent(new Event('blog-updated'));
              }
              
              setTimeout(async () => {
                await fetchWithTimestamp();
                if (isEditing) {
                  window.dispatchEvent(new Event('blog-updated'));
                }
              }, 1500);
            } catch (error) {
              console.error("Error refreshing blogs after update:", error);
            }
          }, 500);
        }
      } catch (error) {
        console.error("Error saving/updating blog:", error);
        setAlert({
          type: "error",
          message: error.response?.data?.message || "There was an error with the blog operation. Please try again.",
          position: "bottom-right",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGeminiGenerate = async () => {
  // // Trigger button animation
  // setIsAnimating(true);
  // setTimeout(() => setIsAnimating(false), 400);

  if (!data.mediumLink.trim()) {
    setAlert({
      type: "error",
      message: "Please enter a Medium link first.",
      position: "top-right",
      duration: 3000,
    });
    return;
  }
    setGeminiAnimated(true); // <-- trigger animation

  try {
    setIsLoading(true);
    const response = await fetch("http://localhost:5000/api/gemini/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mediumLink: data.mediumLink }),
    });

    const result = await response.json();

    if (result?.summary) {
      setdata((prev) => ({
        ...prev,
        metaDescription: result.summary,
      }));
    } else {
      setAlert({
        type: "error",
        message: "Failed to generate summary. Please try again.",
        position: "top-right",
        duration: 3000,
      });
    }
  } catch (err) {
    console.error(err);
    setAlert({
      type: "error",
      message: "Something went wrong while calling Gemini API.",
      position: "top-right",
      duration: 3000,
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleGeminiAutofill = async () => {
  if (!data.mediumLink.trim()) {
    setAlert({
      type: "error",
      message: "Please enter a Medium link first.",
      position: "top-right",
      duration: 3000,
    });
    return;
  }

  setAutoFillAnimated(true); // Start animation
  setTimeout(() => setAutoFillAnimated(false), 400); // Stop animation after 400ms

  try {
    setIsLoading(true);

    const response = await fetch("http://localhost:5000/api/gemini/autofill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mediumLink: data.mediumLink }),
    });

    const result = await response.json();

    if (
      result?.title ||
      result?.author ||
      result?.description ||
      result?.thumbnail ||
      result?.publishedDate
    ) {
      setdata((prev) => ({
        ...prev,
        blogTitle: result.title || prev.blogTitle,
        blogAuthor: result.author || prev.blogAuthor,
        metaDescription: result.description || prev.metaDescription,
        image: result.thumbnail || prev.image,
        blogDate: result.publishedDate || prev.blogDate,

      }));
    } else {
      setAlert({
        type: "error",
        message: "Gemini could not extract blog data. Try again.",
        position: "top-right",
        duration: 3000,
      });
    }
  } catch (err) {
    console.error(err);
    setAlert({
      type: "error",
      message: "Something went wrong while calling Gemini Autofill API.",
      position: "top-right",
      duration: 3000,
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setdata({ ...data, image: file });
    }
  };

  const handleImageUrlChange = (e) => {
    setdata({ ...data, image: e.target.value });
  };

  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };


  return (
    <div style={{ width: "100%", marginLeft: "70px" }}>
      <div className={styles.formHeader}>
        <div className={styles.buttonContainer}>
          <h3 className={styles.headInnerText}>
            <span>New</span> Blog
          </h3>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ marginTop: "auto", marginBottom: "auto", marginRight: "12px" }}>
            {isVisibility ? (
              <IoSettingsSharp
                size={20}
                color="#FF8A00"
                style={{ cursor: "pointer", marginTop: "10px" }}
                onClick={() => setisVisibility(!isVisibility)}
              />
            ) : (
              <IoSettingsOutline
                size={20}
                style={{ cursor: "pointer", marginTop: "10px" }}
                color="#fff"
                onClick={() => setisVisibility(!isVisibility)}
              />
            )}
          </div>

          <Button isLoading={isLoading} onClick={onSaveBlog}>
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {isVisibility && (
        <div style={{
          backgroundColor: "rgb(35, 34, 34)",
          width: "86%",
          margin: ".5em 0",
          padding: "1.6em",
          borderRadius: "8px",
          marginBottom: "1em",
        }}>
          <div style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: "1em"
          }}>
            <label style={{ color: "#fff", margin: "1px 0", fontSize: ".8em" }}>
              Blog Visibility (
              <span style={{ color: !data.isPublished ? "#FF8A00" : "white" }}>
                Private
              </span>
              /
              <span style={{ color: data.isPublished ? "#FF8A00" : "white" }}>
                Public
              </span>
              )
            </label>
            <Switch
              checked={data.isPublished}
              width={36}
              height={18}
              onColor="#FF8A00"
              checkedIcon={false}
              uncheckedIcon={false}
              onChange={() => setdata({ ...data, isPublished: !data.isPublished })}
            />
          </div>
        </div>
      )}
  <div style={{ fontSize: '0.75em', color: '#FF8A00', margin: '0 0 0.5em 0', fontWeight: 400, letterSpacing: '0.01em' }}>
        Don't forget to change visibility to Private/Public in settings
      </div>
      <div style={{
        height: "90vh",
        width: "90%",
        overflow: "hidden scroll",
        scrollbarWidth: "none",
        marginBottom: "50px",
      }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ width: "45%" }}>

          <div className={styles.mediumLinkWrapper}>
            <Input
              placeholder="https://medium.com/@fedkiit/"
              label="Medium Link"
              value={data.mediumLink}
              className={styles.formInput}
              onChange={(e) => setdata({ ...data, mediumLink: e.target.value })}
            />
            <button
              type="button"
              className={`${styles.geminiButtonM} ${autoFillAnimated ? styles.animateMediumLink : ''}`}
              onClick={handleGeminiAutofill}
              title="Autofill with AI"
            >
              <img src={geminiLogo} alt="Gemini" />
            </button>
          </div>

            <Input
              placeholder="Enter Blog Title"
              label="Blog Title"
              value={data.blogTitle}
              className={styles.formInput}
              onChange={(e) => setdata({ ...data, blogTitle: e.target.value })}
            />             

            <div className={styles.descriptionWrapper}>
              <Input
                placeholder="Enter Blog Description"
                label="Blog Description"
                type="textArea"
                className={styles.formInputTxtArea}
                value={data.metaDescription}
                onChange={(e) => setdata({ ...data, metaDescription: e.target.value })}
              />

              <button
                type="button"
                className={`${styles.geminiButtonD} ${geminiAnimated ? styles.animateDescription : ''}`}
                onClick={handleGeminiGenerate}
                title="Generate with Gemini"
              >
                <img src={geminiLogo} alt="Gemini" />
              </button>
            </div>



           <div style={{ position: "relative" }}>
              <Input
                placeholder="Attach Blog Image (URL or upload)"
                label="Blog Image"
                type="text"
                value={
                  data.image instanceof File
                    ? data.image.name
                    : data.image || ""
                }
                containerClassName={styles.formInput}
                onChange={handleImageUrlChange}
                className={styles.formInput}
                style={{ paddingRight: "2.5em" }}
              />
              <button
                type="button"
                onClick={handleAttachClick}
                style={{
                  position: "absolute",
                  right: "4rem",
                  top: "55%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center"
                }}
                title="Upload Image"
              >
                <IoMdAttach size={22} color="#FF8A00" />
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>

            {/* Image preview for both uploaded files and URLs */}
            {data.image && (
              <div style={{ marginTop: "10px" }}>
                <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#666" }}>Preview:</p>
                <img
                  src={
                    data.image instanceof File
                      ? URL.createObjectURL(data.image)
                      : data.image
                  }
                  alt="Blog Thumbnail Preview"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}

            <Input
              placeholder="Select Publication Date"
              className={styles.formInput}
              label="Publication Date"
              type="date"
              style={{ width: "88%" }}
              value={data.blogDate}
              onChange={(date) => setdata({ ...data, blogDate: e.target.value })}
            />
            <Input
              placeholder="Enter Author Name"
              label="Blog Author"
              value={data.blogAuthor}
              className={styles.formInput}
              onChange={(e) => setdata({ ...data, blogAuthor: e.target.value })}
            />
            
          </div>
          <div style={{ width: "45%", paddingTop: "9px"}}>
            <Input
              placeholder="Select Blog Department"
              label="Blog Category"
              type="select"
              options={[
                { label: "Technical", value: "Technical" },
                { label: "Creative", value: "Creative" },
                { label: "Marketing", value: "Marketing" },
                { label: "Operations", value: "Operations" },
              ]}
              className={styles.formInput}
              value={data.blogCategory}
              onChange={(value) => setdata({ ...data, blogCategory: value })}
            />


          </div>
        </div>
      </div>
      <Alert />
      
      <div className={styles.blogListSection}>
        <h3 className={styles.headInnerText}>
          <span>Uploaded</span> Blogs
        </h3>
        
        <div className={styles.filterSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.visibilityFilterContainer}>
            <div className={styles.filterLabel}>Filter by visibility:</div>
            <Input
              type="select"
              name="visibilityFilter"
              value={visibilityFilter}
              placeholder="All"
              onChange={(value) => setVisibilityFilter(value)}
              options={[
                { label: "All", value: "all" },
                { label: "Public", value: "public" },
                { label: "Private", value: "private" }
              ]}
              className={styles.visibilitySelect}
            />
          </div>
        </div>
        
        <div className={styles.blogListContainer}>
          {loadingBlogs ? (
            <div className={styles.loadingContainer}>
              
            </div>
          ) : blogs.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No blogs found. Create your first blog above!</p>
            </div>
          ) : (
            <div className={styles.blogsList}>
              {blogs
                .filter((blog) => {
                  //visibility filter
                  if (visibilityFilter !== 'all') {
                    if (blog.visibility !== visibilityFilter) {
                      return false;
                    }
                  }
                  
                  if (!searchQuery.trim()) return true;
                  
                  const titleMatch = blog.title?.toLowerCase().includes(searchQuery.toLowerCase());
                  const descMatch = blog.desc?.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  let authorName = '';
                  try {
                    const authorObj = typeof blog.author === 'string' ? JSON.parse(blog.author) : blog.author;
                    authorName = authorObj?.name || '';
                  } catch (err) {
                    authorName = String(blog.author || '');
                  }
                  
                  const visibilityMatch = blog.visibility?.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  const authorMatch = authorName.toLowerCase().includes(searchQuery.toLowerCase());
                  
                  return titleMatch || descMatch || authorMatch || visibilityMatch;
                })
                .map((blog) => (
                  <div key={blog.id} className={styles.blogItem}>
                    <div className={styles.visibilityBadge} style={{
                    }}>
                      {blog.visibility === 'private' ? 'Private' : 'Public'}
                    </div>
                    <BlogCard 
                      data={blog} 
                      customButtons={
                        <div className={styles.customButtonContainer}>
                          <button 
                            className={styles.editButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBlog(blog);
                            }}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlog(blog.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      }
                    />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewBlogForm;