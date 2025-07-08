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


-- Function that inserts into payment_history when a ticket is added
CREATE OR REPLACE FUNCTION insert_payment_history_on_ticket()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_history (payment_id, total_payment)
  VALUES (NEW.ticket_id, NEW.total_cost);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT to ticket table
CREATE TRIGGER trg_insert_payment_history
AFTER INSERT ON ticket
FOR EACH ROW
EXECUTE FUNCTION insert_payment_history_on_ticket();


-- Function to delete from payment_history and insert into refund_history
CREATE OR REPLACE FUNCTION handle_ticket_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Step 1: Delete payment history
  DELETE FROM payment_history WHERE payment_id = OLD.ticket_id;

  -- Step 2: Insert into refund history
  INSERT INTO refund_history (refund_id)
  VALUES (OLD.ticket_id);

  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger on ticket deletion
CREATE TRIGGER trg_handle_ticket_delete
AFTER DELETE ON ticket
FOR EACH ROW
EXECUTE FUNCTION handle_ticket_delete();
