import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateUser } from "../Features/UserSlice";
import adminImage from "../Images/default-admin.svg";
import applicantImage from "../Images/default-applicant.svg";
import companyImage from "../Images/default-company.svg";

const getDefaultImage = (role) => {
  if (role === "admin") return adminImage;
  if (role === "company") return companyImage;
  return applicantImage;
};

const ProfilePicture = ({ user }) => {
  const dispatch = useDispatch();
  const [preview, setpreview] = useState(
    user?.profileImage || getDefaultImage(user?.role)
  );

  useEffect(() => {
    setpreview(user?.profileImage || getDefaultImage(user?.role));
  }, [user]);

  const inputId = `profile-picture-${user?._id || "user"}`;

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 750 * 1024) {
      alert("Please select an image smaller than 750 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const profileImage = reader.result;
      setpreview(profileImage);
      try {
        await dispatch(
          updateUser({
            ...user,
            profileImage,
          })
        ).unwrap();
        alert("Profile picture updated.");
      } catch (error) {
        console.log(error);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profilePictureBox">
      <label className="profileCircle" htmlFor={inputId}>
        <img src={preview} alt="Profile" />
      </label>
      <input
        id={inputId}
        className="profileFileInput"
        type="file"
        accept="image/*"
        onChange={handleImageChange}
      />
    </div>
  );
};

export default ProfilePicture;
