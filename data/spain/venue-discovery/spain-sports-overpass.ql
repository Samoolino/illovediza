[out:json][timeout:180];
area["ISO3166-1"="ES"][admin_level=2]->.spain;
(
  nwr["sport"~"(^|;)(padel|tennis)(;|$)"](area.spain);
  nwr["sport"~"(^|;)(soccer|football)(;|$)"]["leisure"="stadium"](area.spain);
  nwr["leisure"="sports_centre"]["sport"~"(^|;)(padel|tennis)(;|$)"](area.spain);
);
out center tags;
