import userImage from "../Images/user.png";
import { useSelector } from "react-redux";

const User = () => {
  const user = useSelector((state) => state.users.user);

  return (
    <div className="userInfos">
      <img src={userImage} alt="user" className="userImage" />
      <h3>{user.fullName}</h3>
      <h5>{user.email}</h5>
      <p>{user.role}</p>
    </div>
  );
};

export default User;
