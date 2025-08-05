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




CREATE OR REPLACE FUNCTION delete_tickets_for_passenger()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM ticket WHERE user_id = OLD.user_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_tickets
BEFORE DELETE ON passenger
FOR EACH ROW
EXECUTE FUNCTION delete_tickets_for_passenger();





CREATE OR REPLACE FUNCTION delete_seat_reservations_for_ticket()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM seat_reservation WHERE ticket_id = OLD.ticket_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_delete_seat_reservations
BEFORE DELETE ON ticket
FOR EACH ROW
EXECUTE FUNCTION delete_seat_reservations_for_ticket();






CREATE OR REPLACE FUNCTION insert_payment_history_on_ticket()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_history (payment_id, total_payment)
  VALUES (NEW.ticket_id, NEW.total_cost);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_insert_payment_history
AFTER INSERT ON ticket
FOR EACH ROW
EXECUTE FUNCTION insert_payment_history_on_ticket();






CREATE OR REPLACE FUNCTION handle_ticket_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM payment_history WHERE payment_id = OLD.ticket_id;

  INSERT INTO refund_history (refund_id)
  VALUES (OLD.ticket_id);

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_ticket_delete
AFTER DELETE ON ticket
FOR EACH ROW
EXECUTE FUNCTION handle_ticket_delete();






DROP TRIGGER IF EXISTS trg_handle_ticket_delete ON ticket;

DROP FUNCTION IF EXISTS handle_ticket_delete();

CREATE OR REPLACE FUNCTION handle_ticket_delete()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM payment_history WHERE payment_id = OLD.ticket_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_ticket_delete
AFTER DELETE ON ticket
FOR EACH ROW
EXECUTE FUNCTION handle_ticket_delete();