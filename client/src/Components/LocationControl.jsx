import { Button } from "reactstrap";

const LocationControl = ({ latitude, longitude, onLocationChange }) => {
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser location is not available.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => alert("Unable to retrieve location.")
    );
  };

  return (
    <div className="locationBox locationServiceBox">
      <Button
        color="secondary"
        outline
        type="button"
        onClick={handleGetLocation}
      >
        Use Browser Location
      </Button>
      <span>
        {latitude && longitude
          ? `${Number(latitude).toFixed(4)}, ${Number(longitude).toFixed(4)}`
          : "No coordinates saved"}
      </span>
    </div>
  );
};

export default LocationControl;
