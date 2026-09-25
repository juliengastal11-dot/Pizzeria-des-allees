"""Construit le style MapLibre « nuit des Allées » à partir du style Dark d'OpenFreeMap :
mêmes tuiles (OpenStreetMap, sans cookie ni clé), couleurs de la charte du site."""
import json
from pathlib import Path

HERE = Path(__file__).parent
s = json.loads((HERE / "dark.json").read_text(encoding="utf-8"))

MINUIT = "#060F2E"
NUIT = "#051A4B"
GRAIN = "#13285A"
EAU = "#123A7A"        # surfaces d'eau : bleu profond, se détache du fond
ORB = "#4F7FC4"        # cours d'eau (l'Orb, le Libron, le canal) : bleu ciel assourdi
VEG = "#0A1D4E"
BATI = "#0B1C4C"
ROUTE_MIN = "#152C63"
ROUTE_MAJ = "#1F3A78"
ROUTE_AUTO = "#2A4789"
PIERRE = "#D7B08E"
CALCAIRE = "#F1E0C8"

peinture = {
    "background": {"background-color": MINUIT},
    "water": {"fill-color": EAU},
    "landcover_ice_shelf": {"fill-color": MINUIT},
    "landcover_glacier": {"fill-color": MINUIT},
    "landuse_residential": {"fill-color": NUIT},
    "landcover_wood": {"fill-color": VEG},
    "landuse_park": {"fill-color": VEG},
    "waterway": {"line-color": ORB},
    "building": {"fill-color": BATI, "fill-outline-color": GRAIN},
    "aeroway-taxiway": {"line-color": GRAIN},
    "aeroway-runway-casing": {"line-color": GRAIN},
    "aeroway-area": {"fill-color": NUIT},
    "aeroway-runway": {"line-color": ROUTE_MIN},
    "road_area_pier": {"fill-color": MINUIT},
    "road_pier": {"line-color": MINUIT},
    "highway_path": {"line-color": GRAIN},
    "highway_minor": {"line-color": ROUTE_MIN},
    "highway_major_casing": {"line-color": "rgba(6,15,46,0.9)"},
    "highway_major_inner": {"line-color": ROUTE_MAJ},
    "highway_major_subtle": {"line-color": ROUTE_MAJ},
    "highway_motorway_casing": {"line-color": "rgba(6,15,46,0.9)"},
    "highway_motorway_inner": {"line-color": ROUTE_AUTO},
    "highway_motorway_subtle": {"line-color": ROUTE_AUTO},
    "railway_transit": {"line-color": GRAIN},
    "railway_transit_dashline": {"line-color": MINUIT},
    "railway_minor": {"line-color": GRAIN},
    "railway_minor_dashline": {"line-color": MINUIT},
    "railway": {"line-color": GRAIN},
    "railway_dashline": {"line-color": MINUIT},
    "highway_name_other": {"text-color": "#7F8DB3", "text-halo-color": MINUIT},
    "highway_name_motorway": {"text-color": "#7F8DB3"},
    "boundary_state": {"line-color": GRAIN},
    "boundary_country_z0-4": {"line-color": GRAIN},
    "boundary_country_z5-": {"line-color": GRAIN},
    "water_name": {"text-color": "#8FB0E4", "text-halo-color": MINUIT},
}
lieux = {"text-color": PIERRE, "text-halo-color": "rgba(6,15,46,0.9)"}

layers = []
for l in s["layers"]:
    lid = l["id"]
    if lid in ("road_oneway", "road_oneway_opposite"):
        continue  # flèches de sens unique : bruit visuel
    p = l.setdefault("paint", {})
    if lid in peinture:
        p.update(peinture[lid])
    elif lid.startswith("place_"):
        p.update(lieux)
    # Cours d'eau plus présents : l'Orb doit se lire comme sur le schéma
    if lid == "waterway":
        p["line-width"] = ["interpolate", ["exponential", 1.4], ["zoom"], 8, 0.8, 12, 2.2, 15, 5]
    layers.append(l)

s["layers"] = layers
s["name"] = "Nuit des Allées"
(HERE / "style-nuit.json").write_text(json.dumps(s, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("ok", len(layers), "calques")
