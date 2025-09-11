-- Populate map_info column with location data from CampusMap.tsx
-- This SQL should be run after the migration to fill in the map_info data

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "thePark",
  "name": "The Park",
  "path": "m 153.64706,314 176.79207,-11.86605 v 100.01422 l 15.34617,-0.22403 31.39117,123.84057 h -33.33333 l -29.82792,0.91096 -28.92568,-0.49026 0.49027,7.84425 h -41.18233 v 12.72677 h -81.27416 -11.09187 z",
  "center": [238, 425],
  "description": ""
}'::jsonb
WHERE "name" = 'The Park';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "eigenHall",
  "name": "Eigen Hall",
  "path": "M 800.46957,442.34191 800.99844,357.0331 680.5,355.57292 l -0.1875,21.41927 -28.25903,-0.48647 v 43.02797 L 679.9375,419.83073 679.75,441.25 Z",
  "center": [730, 402],
  "description": ""
}'::jsonb
WHERE "name" = 'Eigen Hall';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "theClocktower",
  "name": "The Clocktower",
  "path": "m 384.45467,768.65968 -102.17693,-1.94454 1.06066,-126.92567 100.58594,0.35356 z",
  "center": [340, 740],
  "description": "3rd Floor"
}'::jsonb
WHERE "name" = 'The Clocktower';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "playtestingPlaza",
  "name": "Playtesting Plaza",
  "path": "m 330.43913,302.13395 v 100.01422 l 67.16641,-0.98053 2.94159,26.47435 100.99475,-0.49027 1.4708,-86.46839 -103.35521,1.23744 0.17414,-41.47417 z",
  "center": [430, 260],
  "description": "1st floor"
}'::jsonb
WHERE "name" = 'Playtesting Plaza';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "escapeRoomZone",
  "name": "Escape Room Zone",
  "path": "m 605.2834,645.5 h 66.11449 l 0.35355,56.30348 -8.48528,0.35355 v 0 l -0.35355,85.20637 -55.50789,-0.70711 0.35356,-51.61879 6.0104,0.35355 -0.35355,-61.16474 -16.26346,0.35356 0.35356,-29.07987 z",
  "center": [648, 854],
  "description": "2nd floor"
}'::jsonb
WHERE "name" = 'Escape Room Zone';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "theDen",
  "name": "The Den",
  "path": "m 683.173030,275.169300 0.257450,-102.465500 25.984080,-7.844300 32.357540,5.883200 74.064970,-0.371300 1.639040,63.759200 -1.428740,53.050200 -25.493820,0.000000 -0.735400,-12.939700 z",
  "center": [640, 145],
  "description": ""
}'::jsonb
WHERE "name" = 'The Den';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "theGardens",
  "name": "The Gardens",
  "path": "m 736.98204,349.31075 v -57.09887 h 90.86322 v -62.93251 h 135.58773 v 120.03138 z",
  "center": [990, 200],
  "description": ""
}'::jsonb
WHERE "name" = 'The Gardens';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "mindMansion",
  "name": "Mind Mansion",
  "path": "m 318.18248,784.55546 85.30625,0.49027 1.77774,-83.24204 -138.80703,-2.1e-4 v 25.63602 m 51.72304,57.11596 c 0,0 -23.67982,18.31452 -47.06551,-5.63805 -23.52579,-24.09606 -4.65753,-51.47791 -4.65753,-51.47791",
  "center": [340, 854],
  "description": "1st floor"
}'::jsonb
WHERE "name" = 'Mind Mansion';

UPDATE "public"."locations" 
SET "map_info" = '{
  "id": "theUtilityRoom",
  "name": "The Utility Room",
  "path": "M 794.84337,596.41598 671.75144,599.5 l -0.22011,67.25 125.88594,-0.22602 z",
  "center": [750, 560],
  "description": ""
}'::jsonb
WHERE "name" = 'The Utility Room';
