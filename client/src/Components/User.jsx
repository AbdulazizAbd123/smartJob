import userImage from "../Images/user.png";
import { useSelector } from "react-redux";
import Location from "./Location";

const User = () => {
  const user = useSelector((state) => state.users.user);

  return (
    <div className="userInfos">
      <img src={userImage} alt="user" className="userImage" />
      <h3>{user.fullName}</h3>
      <h5>{user.email}</h5>
      <p>{user.role}</p>
      <Location
        latitude={user.latitude}
        longitude={user.longitude}
        place={user.place}
        country={user.country}
        accuracy={user.accuracy}
      />
    </div>
  );
};

export default User;
