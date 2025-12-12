import { useEffect, useState } from "react";
import { 
  X, Download, Loader2, MapPin, Globe, Link2, 
  BarChart2, Users, TrendingUp 
} from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { StrangerButton } from "@/components/ui/StrangerButton";
import { useTheme } from "@/context/ThemeContext";
import { api } from "@/services/api";

interface AnalyticsData {
  slug: string;
  totalClicks: number;
  clicks: Array<{
    id: string;
    timestamp: string | null;
    country: string;
    city: string;
    region: string;
    latitude: number | null;
    longitude: number | null;
    referrer: string;
    userAgent: string;
    hashedIp: string;
  }>;
  heatmapPoints: Array<{ lat: number; lng: number; intensity: number }>;
  countryStats: Record<string, number>;
  cityStats: Record<string, number>;
  referrerStats: Record<string, number>;
}

interface AnalyticsViewProps {
  slug: string;
  onClose: () => void;
}

// Heatmap Layer Component
function HeatmapLayer({ points }: { points: Array<{ lat: number; lng: number; intensity: number }> }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;

    const heatData: [number, number, number][] = points.map(p => [p.lat, p.lng, p.intensity]);
    
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 10,
      max: 1.0,
      gradient: {
        0.2: '#2563eb',
        0.4: '#7c3aed', 
        0.6: '#db2777',
        0.8: '#ea580c',
        1.0: '#dc2626'
      }
    }).addTo(map);

    // Auto-fit bounds if we have points
    if (points.length > 0) {
      const latLngs = points.map(p => L.latLng(p.lat, p.lng));
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}

export default function AnalyticsView({ slug, onClose }: AnalyticsViewProps) {
  const { isUpsideDown } = useTheme();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"heatmap" | "countries" | "referrers">("heatmap");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await api.getLinkAnalytics(slug);
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [slug]);

  // CSV Export Function
  const exportToCSV = () => {
    if (!data || data.clicks.length === 0) return;

    const headers = [
      "Timestamp",
      "Country",
      "City",
      "Region",
      "Latitude",
      "Longitude",
      "Referrer",
      "User Agent"
    ];

    const rows = data.clicks.map(click => [
      click.timestamp || "N/A",
      click.country,
      click.city,
      click.region,
      click.latitude?.toString() || "N/A",
      click.longitude?.toString() || "N/A",
      click.referrer,
      `"${click.userAgent.replace(/"/g, '""')}"` // Escape quotes in user agent
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${slug}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Sort stats for display
  const sortedCountries = data 
    ? Object.entries(data.countryStats).sort((a, b) => b[1] - a[1]).slice(0, 10)
    : [];
  
  const sortedCities = data
    ? Object.entries(data.cityStats).sort((a, b) => b[1] - a[1]).slice(0, 10)
    : [];

  const sortedReferrers = data
    ? Object.entries(data.referrerStats).sort((a, b) => b[1] - a[1]).slice(0, 10)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-4xl my-8 ${
        isUpsideDown 
          ? 'bg-[#0a0a0a] border-2 border-[#E71D36] shadow-[8px_8px_0px_0px_#E71D36]' 
          : 'bg-[var(--color-neo-cream)] border-3 border-[var(--color-neo-black)] shadow-[8px_8px_0px_0px_var(--color-neo-black)] rounded-xl'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 ${
              isUpsideDown 
                ? 'bg-black border border-[#E71D36]' 
                : 'bg-[var(--color-neo-pink)] border-2 border-[var(--color-neo-black)] rounded-lg'
            }`}>
              <BarChart2 className={`w-5 h-5 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${
                isUpsideDown ? 'text-white font-["Merriweather"]' : 'text-[var(--color-neo-black)]'
              }`}>
                Analytics for /{slug}
              </h2>
              <p className={`text-xs ${
                isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'
              }`}>
                {data ? `${data.totalClicks} total clicks` : 'Loading...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StrangerButton
              variant="secondary"
              size="sm"
              onClick={exportToCSV}
              disabled={!data || data.clicks.length === 0}
            >
              <Download className="w-4 h-4 mr-1.5" /> Export CSV
            </StrangerButton>
            <button 
              onClick={onClose}
              className={`p-2 transition-colors ${
                isUpsideDown 
                  ? 'text-[#E71D36] hover:bg-[#E71D36]/10' 
                  : 'text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream-dark)] rounded-lg'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className={`w-8 h-8 animate-spin ${
              isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-pink)]'
            }`} />
          </div>
        ) : error ? (
          <div className={`text-center py-20 ${
            isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'
          }`}>
            {error}
          </div>
        ) : data ? (
          <div className="p-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className={`p-3 ${
                isUpsideDown 
                  ? 'bg-black border border-[#E71D36]/50' 
                  : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-lg'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                  <span className={`text-xs ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>
                    Total Clicks
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isUpsideDown ? 'text-white' : 'text-[var(--color-neo-black)]'}`}>
                  {data.totalClicks}
                </p>
              </div>
              
              <div className={`p-3 ${
                isUpsideDown 
                  ? 'bg-black border border-[#E71D36]/50' 
                  : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-lg'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                  <span className={`text-xs ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>
                    Countries
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isUpsideDown ? 'text-white' : 'text-[var(--color-neo-black)]'}`}>
                  {Object.keys(data.countryStats).length}
                </p>
              </div>
              
              <div className={`p-3 ${
                isUpsideDown 
                  ? 'bg-black border border-[#E71D36]/50' 
                  : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-lg'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                  <span className={`text-xs ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>
                    Cities
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isUpsideDown ? 'text-white' : 'text-[var(--color-neo-black)]'}`}>
                  {Object.keys(data.cityStats).length}
                </p>
              </div>
              
              <div className={`p-3 ${
                isUpsideDown 
                  ? 'bg-black border border-[#E71D36]/50' 
                  : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-lg'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Link2 className={`w-4 h-4 ${isUpsideDown ? 'text-[#E71D36]' : 'text-[var(--color-neo-black)]'}`} />
                  <span className={`text-xs ${isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'}`}>
                    Referrers
                  </span>
                </div>
                <p className={`text-2xl font-bold ${isUpsideDown ? 'text-white' : 'text-[var(--color-neo-black)]'}`}>
                  {Object.keys(data.referrerStats).length}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-1 mb-4 p-1 ${
              isUpsideDown 
                ? 'bg-black border border-[#E71D36]/30' 
                : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-lg'
            }`}>
              {[
                { id: "heatmap", label: "Geographic Heatmap", icon: MapPin },
                { id: "countries", label: "Top Countries", icon: Globe },
                { id: "referrers", label: "Top Referrers", icon: Users }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? isUpsideDown
                        ? 'bg-[#E71D36] text-white'
                        : 'bg-[var(--color-neo-black)] text-[var(--color-neo-cream)] rounded-md'
                      : isUpsideDown
                        ? 'text-white/60 hover:text-white hover:bg-[#E71D36]/20'
                        : 'text-[var(--color-neo-black)]/70 hover:text-[var(--color-neo-black)] hover:bg-[var(--color-neo-cream)] rounded-md'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "heatmap" && (
              <div className={`h-[400px] overflow-hidden ${
                isUpsideDown 
                  ? 'border border-[#E71D36]/50' 
                  : 'border-2 border-[var(--color-neo-black)] rounded-lg'
              }`}>
                {data.heatmapPoints.length > 0 ? (
                  <MapContainer
                    center={[20, 0]}
                    zoom={2}
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url={isUpsideDown
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      }
                    />
                    <HeatmapLayer points={data.heatmapPoints} />
                  </MapContainer>
                ) : (
                  <div className={`h-full flex items-center justify-center ${
                    isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'
                  }`}>
                    <div className="text-center">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No geographic data available yet</p>
                      <p className="text-xs mt-1">Clicks will appear here once captured</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "countries" && (
              <div className={`p-4 ${
                isUpsideDown 
                  ? 'bg-black border border-[#E71D36]/50' 
                  : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-lg'
              }`}>
                {sortedCountries.length > 0 ? (
                  <div className="space-y-3">
                    {sortedCountries.map(([country, count], idx) => (
                      <div key={country} className="flex items-center gap-3">
                        <span className={`w-6 text-center font-bold ${
                          isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium ${
                              isUpsideDown ? 'text-white' : 'text-[var(--color-neo-black)]'
                            }`}>
                              {country}
                            </span>
                            <span className={`text-sm ${
                              isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'
                            }`}>
                              {count} ({Math.round((count / data.totalClicks) * 100)}%)
                            </span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${
                            isUpsideDown ? 'bg-[#E71D36]/20' : 'bg-[var(--color-neo-black)]/20'
                          }`}>
                            <div 
                              className={`h-full rounded-full transition-all ${
                                isUpsideDown ? 'bg-[#E71D36]' : 'bg-[var(--color-neo-pink)]'
                              }`}
                              style={{ width: `${(count / sortedCountries[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Cities List */}
                    {sortedCities.length > 0 && (
                      <>
                        <div className={`border-t pt-3 mt-4 ${
                          isUpsideDown ? 'border-[#E71D36]/30' : 'border-[var(--color-neo-black)]/30'
                        }`}>
                          <h4 className={`text-sm font-bold mb-3 ${
                            isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'
                          }`}>
                            Top Cities
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {sortedCities.map(([city, count]) => (
                              <div key={city} className={`flex items-center justify-between text-sm p-2 ${
                                isUpsideDown 
                                  ? 'bg-[#E71D36]/10 border border-[#E71D36]/30' 
                                  : 'bg-[var(--color-neo-cream)] border border-[var(--color-neo-black)]/30 rounded'
                              }`}>
                                <span className={isUpsideDown ? 'text-white/80' : 'text-[var(--color-neo-black)]'}>
                                  {city}
                                </span>
                                <span className={`font-bold ${
                                  isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'
                                }`}>
                                  {count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${
                    isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'
                  }`}>
                    No country data available yet
                  </div>
                )}
              </div>
            )}

            {activeTab === "referrers" && (
              <div className={`p-4 ${
                isUpsideDown 
                  ? 'bg-black border border-[#E71D36]/50' 
                  : 'bg-[var(--color-neo-cream-dark)] border-2 border-[var(--color-neo-black)] rounded-lg'
              }`}>
                {sortedReferrers.length > 0 ? (
                  <div className="space-y-3">
                    {sortedReferrers.map(([referrer, count], idx) => (
                      <div key={referrer} className="flex items-center gap-3">
                        <span className={`w-6 text-center font-bold ${
                          isUpsideDown ? 'text-[#E71D36] font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-medium ${
                              isUpsideDown ? 'text-white' : 'text-[var(--color-neo-black)]'
                            }`}>
                              {referrer === "direct" ? "Direct Traffic" : referrer}
                            </span>
                            <span className={`text-sm ${
                              isUpsideDown ? 'text-white/60 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/70'
                            }`}>
                              {count} ({Math.round((count / data.totalClicks) * 100)}%)
                            </span>
                          </div>
                          <div className={`h-2 rounded-full overflow-hidden ${
                            isUpsideDown ? 'bg-[#E71D36]/20' : 'bg-[var(--color-neo-black)]/20'
                          }`}>
                            <div 
                              className={`h-full rounded-full transition-all ${
                                isUpsideDown ? 'bg-[#E71D36]' : 'bg-[var(--color-neo-green)]'
                              }`}
                              style={{ width: `${(count / sortedReferrers[0][1]) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${
                    isUpsideDown ? 'text-white/50 font-["Courier_Prime"]' : 'text-[var(--color-neo-black)]/60'
                  }`}>
                    No referrer data available yet
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
