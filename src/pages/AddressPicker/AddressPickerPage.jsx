import React, { useEffect, useState, useRef } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents,
    Popup,
} from "react-leaflet";
import L from "leaflet";
import styles from "./AddressPickerPage.module.css";
import { addressTypes } from "../../data/staticData";
import { useLocation } from "../../hooks/useLocation";
import config from "../../config/env";
import addressService from "../../services/addressService";

/* simple pin icon (avoid default icon path issues) */
const pinUrl = config.getFlaticonUrl("/512/684/684908.png");
const pinIcon = new L.Icon({
    iconUrl: pinUrl,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
});

function MapClickHandler({ position, setPosition, onDragLatLng }) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            if (onDragLatLng) onDragLatLng(e.latlng);
        },
    });
    return null;
}


export default function AddressPickerPage({ show, onClose, onSave }) {
    const [showDetails, setShowDetails] = useState(false); // opens address form
    const mapRef = useRef(null);
    
    // Use the location hook
    const {
        coords,
        address,
        isLoadingAddress,
        searchQuery,
        setSearchQuery,
        searchResults,
        debouncedSearch,
        setLocation,
        getCurrentLocation,
        clearSearch
    } = useLocation({
        enableGeolocation: true,
        enableReverseGeocoding: true,
        enableSearch: true,
        defaultLocation: { lat: 25.2048, lng: 55.2708 } // Dubai default
    });



    // handle marker drag
    const onMarkerDragEnd = async (e) => {
        const lat = e.target.getLatLng().lat;
        const lng = e.target.getLatLng().lng;
        setLocation(lat, lng);
    };


    // pick search result -> move marker & map center
    function pickResult(r) {
        const lat = Number(r.lat);
        const lon = Number(r.lon);
        setLocation(lat, lon);
        clearSearch();
        setSearchQuery(r.display_name);

        // move map if available
        if (mapRef.current) {
            try {
                mapRef.current.setView([lat, lon], 16);
            } catch (err) { /* ignore */ }
        }
    }

    // Save from details form (child) -> close both and pass up
    const handleSaveAddress = (payload) => {
        // payload should include address fields + coords
        const result = {
            lat: coords?.[0],
            lng: coords?.[1],
            display_address: address,
            ...payload,
        };
        if (onSave) onSave(result);
        // close form and picker
        setShowDetails(false);
        onClose();
    };

    if (!show) return null;

    return (
        <div className={styles.fullscreenOverlay} onClick={onClose}>
            <div
                className={styles.container}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* map header/search (overlayed) */}
                <div className={styles.searchRow}>
                    <button className={styles.closeTop} onClick={onClose}>
                        ←
                    </button>
                    <input
                        className={styles.searchInput}
                        placeholder="Search for a new area, locality..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            debouncedSearch(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") debouncedSearch(searchQuery);
                        }}
                    />

                </div>

                {/* <div className={styles.mapArea}>
                    {coords && (
                        <MapContainer
                            center={coords}
                            zoom={16}
                            style={{ height: "100%", width: "100%" }}
                            whenCreated={(map) => {
                                mapRef.current = map;
                            }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />
                            <Marker
                                position={coords}
                                icon={pinIcon}
                                draggable
                                eventHandlers={{ dragend: onMarkerDragEnd }}
                            >
                                <Popup>Drag to adjust pin</Popup>
                            </Marker>
                            <MapClickHandler
                                position={coords}
                                setPosition={(p) => {
                                    setLocation(p[0], p[1]);
                                }}
                            />
                        </MapContainer>
                    )}
                </div> */}

                {/* search results dropdown (small) */}
                {searchResults.length > 0 && (
                    <div className={styles.searchResults}>
                        {searchResults.map((r) => (
                            <div
                                key={r.place_id}
                                className={styles.searchResultItem}
                                onClick={() => pickResult(r)}
                            >
                                <div className={styles.resultTitle}>{r.display_name}</div>
                                <div className={styles.resultMeta}>
                                    {r.type} · {r.address?.county || r.address?.city || ""}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* bottom card showing current location */}
                <div className={styles.bottomCard}>
                    <div className={styles.cardContent}>
                        <div>
                            <div className={styles.cardTitle}>Your current location</div>
                            <div className={styles.cardAddress}>
                                {isLoadingAddress ? "Finding address..." : address}
                            </div>
                        </div>
                        <div className={styles.cardActions}>
                            <button
                                className={styles.changeBtn}
                                onClick={() => {
                                    getCurrentLocation().then((newCoords) => {
                                        if (mapRef.current) {
                                            mapRef.current.setView(newCoords, 16);
                                        }
                                    }).catch(() => {
                                        // Error handling is done in the hook
                                    });
                                }}
                            >
                                change
                            </button>
                        </div>
                    </div>

                    <div className={styles.pinInfo}>
                        Pin location is {Math.floor(Math.random() * 999)}
                    </div>

                    <button
                        className={styles.addDetailsBtn}
                        onClick={() => setShowDetails(true)}
                    >
                        Add more address details
                    </button>
                </div>

                {/* Address details modal (bottom sheet on top of existing screen) */}
                {showDetails && (
                    <AddressDetailsModal
                        onClose={() => setShowDetails(false)}
                        address={address}
                        coords={coords}
                        onSave={handleSaveAddress}
                        onChangeLocation={() => {
                            // close form and keep map visible so user can change pin
                            setShowDetails(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

/* The bottom sheet form for entering full address details */
function AddressDetailsModal({ onClose, address, coords, onSave, onChangeLocation }) {
    const [orderingFor, setOrderingFor] = useState("myself");
    const [label, setLabel] = useState("home");
    const [flat, setFlat] = useState("");
    const [floor, setFloor] = useState(address || "");
    const [locationId, setLocationId] = useState("");
    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Fetch locations from API
        const loadLocations = async () => {
            setLoadingLocations(true);
            const result = await addressService.fetchLocations();
            if (result.success) {
                setLocations(result.data);
            }
            setLoadingLocations(false);
        };
        loadLocations();
    }, []);

    // Update floor when address from map changes
    useEffect(() => {
        setFloor(address || "");
    }, [address]);

    const submit = () => {
        if (!flat.trim()) {
            window.alert("Please enter flat / house no / building name");
            return;
        }
        if (!locationId) {
            window.alert("Please select Area / Sector / Locality");
            return;
        }
        setSaving(true);

        // Find the selected location name
        const selectedLocation = locations.find(loc => loc.id === parseInt(locationId));

        const payload = {
            orderingFor,
            label,
            flat,
            floor,
            locationId: parseInt(locationId),
            locationName: selectedLocation ? selectedLocation.name : "",
            coords,
        };
        // simulate small delay
        setTimeout(() => {
            setSaving(false);
            onSave(payload);
        }, 400);
    };

    return (
        <div className={styles.detailsOverlay} onClick={onClose}>
            <div className={styles.detailsSheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.detailsHeader}>
                    <button 
                        className={styles.detailsBack} 
                        onClick={onChangeLocation}
                        type="button"
                    >
                        <img src="/icons/left-arrow.svg" alt="Back" />
                    </button>
                    <h4>Enter complete address</h4>
                    <button className={styles.detailsClose} onClick={onClose} type="button">
                        ✕
                    </button>
                </div>

                <div className={styles.section}>
                    <div className={styles.label}>Who you are ordering for?</div>
                    <div className={styles.radioRow}>
                        <label className={styles.radioItem}>
                            <input
                                type="radio"
                                className={styles.checkBox}
                                name="orderFor"
                                checked={orderingFor === "myself"}
                                onChange={() => setOrderingFor("myself")}
                            />
                            <span>Myself</span>
                        </label>
                        <label className={styles.radioItem}>
                            <input
                                type="radio"
                                className={styles.checkBox}
                                name="orderFor"
                                checked={orderingFor === "someone"}
                                onChange={() => setOrderingFor("someone")}
                            />
                            <span>Someone else</span>
                        </label>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.label}>Save address as *</div>
                    <div className={styles.saveAsRow}>
                        {addressTypes.map((type) => (
                            <button
                                key={type.id}
                                className={`${styles.saveAsBtn} ${label === type.id ? styles.saveAsActive : ""}`}
                                onClick={() => setLabel(type.id)}
                                type="button"
                            >
                                <img src={type.icon} alt={type.label} className={styles.icon} />
                                {type.label}
                            </button>
                        ))}

                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.label}>Flat / House no / Building name *</div>
                    <input
                        className={styles.input}
                        placeholder="Flat / House no / Building name"
                        value={flat}
                        onChange={(e) => setFlat(e.target.value)}
                    />
                    <input
                        className={styles.input}
                        placeholder="Other details"
                        value={floor}
                        onChange={(e) => setFloor(e.target.value)}
                    />
                </div>

                {/* <div className={styles.section}>
                    <div className={styles.label}>Floor (optional)</div>

                </div> */}

                <div className={styles.section}>
                    <div className={styles.label}>Area / Sector / Locality *</div>
                    {loadingLocations ? (
                        <div className={styles.input} style={{ color: '#999' }}>
                            Loading locations...
                        </div>
                    ) : (
                        <select
                            className={styles.input}
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            style={{ padding: '12px', cursor: 'pointer' }}
                        >
                            <option value="">Select Area / Sector / Locality</option>
                            {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                    {location.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className={styles.detailsFooter}>
                    {/* <button className={styles.cancelBtn} onClick={onClose}>Cancel</button> */}
                    <button className={styles.saveBtn} onClick={submit} disabled={saving}>
                        {saving ? "Saving..." : "Save address"}
                    </button>
                </div>
            </div>
        </div>
    );
}
