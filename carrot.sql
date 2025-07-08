-- -- specifies all stations in the route

-- WITH RECURSIVE StationSequence AS (
--     SELECT 
--         rs.route_id,
--         rs.station_id,
--         rs.sequence_number,
--         s.station_name
--     FROM 
--         route_stations rs
--     JOIN 
--         station s ON rs.station_id = s.station_id
--     WHERE 
--         rs.route_id = 2 
--     UNION ALL
--     SELECT 
--         rs.route_id,
--         rs.station_id,
--         rs.sequence_number,
--         s.station_name
--     FROM 
--         route_stations rs
--     JOIN 
--         StationSequence ss ON rs.route_id = ss.route_id AND rs.sequence_number = ss.sequence_number + 1
--     JOIN 
--         station s ON rs.station_id = s.station_id
-- );



-- SELECT s.seat_id
-- FROM seat s
-- INNER JOIN seat_availability sa ON s.seat_id = sa.seat_id
-- INNER JOIN station st ON sa.station_id = st.station_id
-- WHERE s.train_id = 704
-- AND s.class_id = 4
-- AND sa.travel_date = '2024-02-15'
-- AND sa.available = TRUE
-- AND st.station_id IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)
-- GROUP BY s.seat_id
-- HAVING COUNT(*) = 10;


-- write a function to select which which offer is applicable for the useer
-- write a function to find out which route will be the fastest





WITH RECURSIVE StationSequence AS (
    SELECT 
        rs.route_id,
        rs.station_id,
        rs.sequence_number,
        s.station_name
    FROM 
        route_stations rs
    JOIN 
        station s ON rs.station_id = s.station_id
    WHERE 
        rs.route_id = 2 
    UNION ALL
    SELECT 
        rs.route_id,
        rs.station_id,
        rs.sequence_number,
        s.station_name
    FROM 
        route_stations rs
    JOIN 
        StationSequence ss ON rs.route_id = ss.route_id AND rs.sequence_number = ss.sequence_number + 1
    JOIN 
        station s ON rs.station_id = s.station_id
		
)

SELECT DISTINCT * FROM StationSequence
ORDER BY sequence_number;



SELECT DISTINCT tr.route_id, t.train_id, t.train_name
FROM train t
JOIN train_routes tr ON t.train_id = tr.train_id
JOIN route_stations rs_from ON tr.route_id = rs_from.route_id
JOIN route_stations rs_to ON tr.route_id = rs_to.route_id
JOIN station s_from ON rs_from.station_id = s_from.station_id
JOIN station s_to ON rs_to.station_id = s_to.station_id
WHERE s_from.station_id = $1
AND s_to.station_id = $2
AND rs_from.sequence_number < rs_to.sequence_number;





-- individual seat count for specific train class

	