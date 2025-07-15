CREATE OR REPLACE FUNCTION get_unavailable_seats(
  p_train_code integer,
  p_from_station text,
  p_to_station text,
  p_date date
)
RETURNS TABLE (
  class_code integer,
  seat_number integer
) AS $$
BEGIN
  RETURN QUERY
  WITH station_order_cte AS (
    SELECT string_to_array(r.order_of_stations, ' ') AS station_order
    FROM train t
    JOIN route r ON t.route_id = r.route_id
    WHERE t.train_code = p_train_code
  )
  SELECT
    sr.class_code,
    sr.seat_number
  FROM
    seat_reservation sr,
    station_order_cte soc
  WHERE
    sr.train_code = p_train_code
    AND sr.date = p_date
    AND (
      (
        array_position(soc.station_order, sr.from_station) <= array_position(soc.station_order, p_from_station)
        AND array_position(soc.station_order, p_from_station) <= array_position(soc.station_order, sr.to_station)
      )
      OR
      (
        array_position(soc.station_order, p_from_station) <= array_position(soc.station_order, sr.from_station)
        AND array_position(soc.station_order, sr.from_station) <= array_position(soc.station_order, p_to_station)
      )
    );
END;
$$ LANGUAGE plpgsql;