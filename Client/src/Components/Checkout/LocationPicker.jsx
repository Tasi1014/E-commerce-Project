import { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = { lat: 27.7172, lng: 85.3240 }; // Kathmandu fallback

function DraggableMarker({ position, setPosition, onDragEnd }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const newPos = marker.getLatLng();
        setPosition(newPos);
        onDragEnd(newPos);
      }
    },
  };

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onDragEnd(e.latlng);
    },
  });

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
}

function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, 15);
  }, [position, map]);
  return null;
}

export default function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(null);
  const debounceRef = useRef(null);
  const searchWrapperRef = useRef(null);

  const reverseGeocode = useCallback(async (latlng) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await res.json();
      const addr = data.address || {};

      onLocationSelect({
        lat: latlng.lat,
        lng: latlng.lng,
        address: data.display_name || '',
        city: addr.city || addr.town || addr.village || '',
        province: addr.state || '',
      });
    } catch (err) {
      console.error('Reverse geocode failed:', err);
    } finally {
      setLoading(false);
    }
  }, [onLocationSelect]);

  // Ask for current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setPosition(newPos);
          setRecenterTrigger(newPos);
          reverseGeocode(newPos);
          setLocating(false);
        },
        (err) => {
          console.warn('Geolocation denied or failed, using default center.', err);
          setLocating(false);
        }
      );
    } else {
      setLocating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced live search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSearchResult = (result) => {
    const newPos = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
    setPosition(newPos);
    setRecenterTrigger(newPos);
    setSearchResults([]);
    setShowDropdown(false);
    setSearchQuery(result.display_name);
    reverseGeocode(newPos);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        setRecenterTrigger(newPos);
        reverseGeocode(newPos);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  return (
    <div className="w-full">
      {/* Search bar */}
      <div ref={searchWrapperRef} className="relative mb-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            placeholder="Search for your area, street, or landmark..."
            className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-black/80 focus:border-transparent
                       placeholder:text-gray-400 transition-shadow"
          />
          {searching && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
            />
          )}
        </div>

        {showDropdown && searchResults.length > 0 && (
          <ul className="absolute z-[1000] w-full mt-1.5 bg-white border border-gray-200
                         rounded-xl shadow-lg max-h-56 overflow-y-auto py-1">
            {searchResults.map((result) => (
              <li
                key={result.place_id}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSearchResult(result);
                }}
                className="flex items-start gap-2 px-3 py-2.5 text-sm cursor-pointer
                           hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 leading-snug">{result.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-[220px] sm:h-[280px] md:h-[320px]"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <DraggableMarker
            position={position}
            setPosition={setPosition}
            onDragEnd={reverseGeocode}
          />
          {recenterTrigger && <RecenterMap position={recenterTrigger} />}
        </MapContainer>

        {/* Use my location button */}
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="absolute bottom-3 right-3 z-[1000] bg-white shadow-md rounded-full
                     w-10 h-10 flex items-center justify-center hover:bg-gray-50
                     transition-colors disabled:opacity-50"
          title="Use my current location"
        >
          {locating ? (
            <Loader2 size={18} className="animate-spin text-gray-600" />
          ) : (
            <Navigation size={18} className="text-gray-700" />
          )}    
        </button>

        {/* Loading overlay for reverse geocode */}
        {loading && (
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm
                          px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
            <Loader2 size={13} className="animate-spin text-gray-500" />
            <span className="text-xs text-gray-600">Finding address...</span>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
        <MapPin size={12} />
        Search, drag the pin, or tap the map to set your delivery location
      </p>
    </div>
  );
}