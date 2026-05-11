import { Button } from "reactstrap";
import { useEffect, useState } from "react";

const OPENCAGE_API_KEY = "65a9c439d53b4180af316d6b0c27035f"; // Get it at https://opencagedata.com

const getPlaceName = (components) =>
  components.city ||
  components.town ||
  components.village ||
  components.suburb ||
  components.county ||
  components.state ||
  components.country ||
  "";

const formatCoordinate = (value) =>
  value || value === 0 ? Number(value).toFixed(4) : "Not selected";

const formatAccuracy = (value) =>
  value || value === 0 ? `${Math.round(Number(value))} meters` : "Not selected";

const Location = ({
  latitude,
  longitude,
  place,
  country,
  accuracy,
  onLocationChange,
}) => {
  const [isLoading, setisLoading] = useState(false);
  const [locationInfo, setlocationInfo] = useState({
    place: place || "",
    country: country || "",
    latitude: latitude || "",
    longitude: longitude || "",
    accuracy: accuracy || "",
  });

  useEffect(() => {
    setlocationInfo({
      place: place || "",
      country: country || "",
      latitude: latitude || "",
      longitude: longitude || "",
      accuracy: accuracy || "",
    });
  }, [accuracy, country, latitude, longitude, place]);

  const getLocationDetails = async (latitudeValue, longitudeValue) => {
    try {
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${latitudeValue},${longitudeValue}&key=${OPENCAGE_API_KEY}`
      );
      const data = await response.json();

      if (data.status?.code !== 200) {
        alert(data.status?.message || "Location details could not be loaded.");
        return {};
      }

      const result = data.results?.[0];
      const components = result?.components || {};
      const placeName = getPlaceName(components);
      const countryName = components.country || "";

      return {
        place: placeName,
        country: countryName,
        location:
          result?.formatted || [placeName, countryName].filter(Boolean).join(", "),
      };
    } catch (error) {
      alert("Location details could not be loaded.");
      return {};
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Browser location is not available.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setisLoading(true);
        const latitudeValue = position.coords.latitude;
        const longitudeValue = position.coords.longitude;
        const accuracyValue = position.coords.accuracy;
        const locationDetails = await getLocationDetails(
          latitudeValue,
          longitudeValue
        );
        const nextLocationInfo = {
          latitude: latitudeValue,
          longitude: longitudeValue,
          accuracy: accuracyValue,
          ...locationDetails,
        };

        setlocationInfo(nextLocationInfo);
        if (onLocationChange) {
          onLocationChange(nextLocationInfo);
        }
        setisLoading(false);
      },
      () => {
        setisLoading(false);
        alert("Unable to retrieve location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="locationBox locationServiceBox">
      <Button
        color="secondary"
        outline
        type="button"
        onClick={handleGetLocation}
        disabled={isLoading}
      >
        {isLoading ? "Finding Location..." : "Use Browser Location"}
      </Button>
      <div className="locationDetails">
        <p>
          <strong>Place:</strong> {locationInfo.place || "Not selected"}
        </p>
        <p>
          <strong>Country:</strong> {locationInfo.country || "Not selected"}
        </p>
        <p>
          <strong>Latitude:</strong> {formatCoordinate(locationInfo.latitude)}
        </p>
        <p>
          <strong>Longitude:</strong> {formatCoordinate(locationInfo.longitude)}
        </p>
        <p>
          <strong>Accuracy:</strong> {formatAccuracy(locationInfo.accuracy)}
        </p>
      </div>
    </div>
  );
};

export default Location;
