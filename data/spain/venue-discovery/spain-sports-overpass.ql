[out:json][timeout:240];
area["ISO3166-1"="ES"][admin_level=2]->.spain;
(
  nwr["sport"~"(^|;)(padel|tennis)(;|$)"](area.spain);
  nwr["sport:padel"="yes"](area.spain);
  nwr["sport:tennis"="yes"](area.spain);
  nwr["leisure"="sports_centre"]["sport"~"(^|;)(padel|tennis)(;|$)"](area.spain);
  nwr["leisure"="stadium"]["sport"~"(^|;)(soccer|football)(;|$)"](area.spain);
);
out center tags;
