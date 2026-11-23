[out:json][timeout:180];
area["ISO3166-2"="{{REGION_CODE}}"][admin_level=4]->.region;
(
  nwr["sport"~"(^|;)(padel|tennis)(;|$)"](area.region);
  nwr["sport:padel"="yes"](area.region);
  nwr["sport:tennis"="yes"](area.region);
  nwr["leisure"="sports_centre"]["sport"~"(^|;)(padel|tennis)(;|$)"](area.region);
  nwr["leisure"="stadium"]["sport"~"(^|;)(soccer|football)(;|$)"](area.region);
);
out center tags;
