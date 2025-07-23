--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-16 17:10:35

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 236 (class 1255 OID 17229)
-- Name: delete_seat_reservations_for_ticket(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_seat_reservations_for_ticket() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM seat_reservation WHERE ticket_id = OLD.ticket_id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION public.delete_seat_reservations_for_ticket() OWNER TO postgres;

--
-- TOC entry 235 (class 1255 OID 17227)
-- Name: delete_tickets_for_passenger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_tickets_for_passenger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM ticket WHERE user_id = OLD.user_id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION public.delete_tickets_for_passenger() OWNER TO postgres;

--
-- TOC entry 239 (class 1255 OID 17243)
-- Name: get_classes_by_train(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_classes_by_train(p_train_code text) RETURNS TABLE(class_code text, class_name text, total_seat integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT s.class_code, c.class_name, s.total_seat
    FROM seat s
    JOIN class c ON (s.class_code = c.class_code)
    WHERE s.train_code = p_train_code;
END;
$$;


ALTER FUNCTION public.get_classes_by_train(p_train_code text) OWNER TO postgres;

--
-- TOC entry 252 (class 1255 OID 17240)
-- Name: get_possible_routes(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_possible_routes(p_from_city text, p_to_city text) RETURNS TABLE(route_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT rs1.route_id
    FROM route_station rs1
    JOIN station s1 ON rs1.station_id = s1.station_id
    WHERE s1.station_name = p_from_city
    INTERSECT
    SELECT rs2.route_id
    FROM route_station rs2
    JOIN station s2 ON rs2.station_id = s2.station_id
    WHERE s2.station_name = p_to_city;
END;
$$;


ALTER FUNCTION public.get_possible_routes(p_from_city text, p_to_city text) OWNER TO postgres;

--
-- TOC entry 253 (class 1255 OID 17241)
-- Name: get_route_sequence(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_route_sequence(p_route_id integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_order_of_stations TEXT;
BEGIN
    SELECT order_of_stations INTO v_order_of_stations
    FROM route 
    WHERE route_id = p_route_id;
    
    RETURN v_order_of_stations;
END;
$$;


ALTER FUNCTION public.get_route_sequence(p_route_id integer) OWNER TO postgres;

--
-- TOC entry 251 (class 1255 OID 17239)
-- Name: get_station_ids(text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_station_ids(p_from_city text, p_to_city text) RETURNS TABLE(station_id text, station_name text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT s.station_id, s.station_name 
    FROM station s
    WHERE s.station_name = p_from_city OR s.station_name = p_to_city;
END;
$$;


ALTER FUNCTION public.get_station_ids(p_from_city text, p_to_city text) OWNER TO postgres;

--
-- TOC entry 254 (class 1255 OID 17242)
-- Name: get_trains_by_route(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_trains_by_route(p_route_id integer) RETURNS TABLE(train_code text, name text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT t.train_code, t.name 
    FROM train t
    WHERE t.route_id = p_route_id;
END;
$$;


ALTER FUNCTION public.get_trains_by_route(p_route_id integer) OWNER TO postgres;

--
-- TOC entry 255 (class 1255 OID 17257)
-- Name: get_unavailable_seats(integer, text, text, date); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_unavailable_seats(p_train_code integer, p_from_station text, p_to_station text, p_date date) RETURNS TABLE(class_code integer, seat_number integer)
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.get_unavailable_seats(p_train_code integer, p_from_station text, p_to_station text, p_date date) OWNER TO postgres;

--
-- TOC entry 237 (class 1255 OID 17258)
-- Name: handle_ticket_delete(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_ticket_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Only delete from payment_history, no refund insertion
  DELETE FROM payment_history WHERE payment_id = OLD.ticket_id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION public.handle_ticket_delete() OWNER TO postgres;

--
-- TOC entry 238 (class 1255 OID 17231)
-- Name: insert_payment_history_on_ticket(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_payment_history_on_ticket() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO payment_history (payment_id, total_payment)
  VALUES (NEW.ticket_id, NEW.total_cost);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_payment_history_on_ticket() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 17014)
-- Name: admin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin (
    admin_id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    salary integer NOT NULL,
    user_name character varying,
    password character varying
);


ALTER TABLE public.admin OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 17193)
-- Name: class; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class (
    class_code integer NOT NULL,
    class_name character varying(100) NOT NULL,
    cost_per_unit integer
);


ALTER TABLE public.class OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17214)
-- Name: distance_storage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.distance_storage (
    from_station integer NOT NULL,
    to_station integer NOT NULL,
    distance_unit integer NOT NULL
);


ALTER TABLE public.distance_storage OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17071)
-- Name: layout; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.layout (
    layout_id integer NOT NULL,
    class_code integer NOT NULL,
    train_code integer NOT NULL,
    version integer
);


ALTER TABLE public.layout OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 17021)
-- Name: passenger; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.passenger (
    user_id integer NOT NULL,
    name character varying,
    phone_number integer,
    username character varying,
    password character varying
);


ALTER TABLE public.passenger OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17101)
-- Name: payment_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_history (
    payment_id integer NOT NULL,
    payment_method character varying,
    total_payment integer
);


ALTER TABLE public.payment_history OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17115)
-- Name: refund_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refund_history (
    refund_id integer NOT NULL,
    refund_method character varying,
    refund_date date
);


ALTER TABLE public.refund_history OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 17035)
-- Name: route; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route (
    route_id integer NOT NULL,
    route_name character varying NOT NULL,
    total_station integer,
    order_of_stations character varying
);


ALTER TABLE public.route OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 17158)
-- Name: route_station; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_station (
    station_id integer NOT NULL,
    route_id integer NOT NULL
);


ALTER TABLE public.route_station OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17081)
-- Name: seat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seat (
    total_seat integer NOT NULL,
    class_code integer NOT NULL,
    train_code integer NOT NULL
);


ALTER TABLE public.seat OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 17146)
-- Name: seat_coordinate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seat_coordinate (
    layout_id integer NOT NULL,
    seat_name character varying NOT NULL,
    x_coordinate integer NOT NULL,
    y_coordinate integer NOT NULL
);


ALTER TABLE public.seat_coordinate OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17129)
-- Name: seat_reservation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seat_reservation (
    ticket_id integer NOT NULL,
    seat_number integer NOT NULL,
    class_code integer NOT NULL,
    train_code integer NOT NULL,
    from_station character varying NOT NULL,
    to_station character varying NOT NULL,
    date date
);


ALTER TABLE public.seat_reservation OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 17028)
-- Name: station; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.station (
    station_id integer NOT NULL,
    station_name character varying NOT NULL,
    location character varying,
    zone character varying,
    post_code integer
);


ALTER TABLE public.station OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 17236)
-- Name: ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ticket_id_seq OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17091)
-- Name: ticket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ticket (
    ticket_id integer DEFAULT nextval('public.ticket_id_seq'::regclass) NOT NULL,
    total_cost integer,
    user_id integer
);


ALTER TABLE public.ticket OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17173)
-- Name: time_table; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_table (
    train_code integer NOT NULL,
    station_id integer NOT NULL,
    arrival_time time without time zone NOT NULL,
    departure_time time without time zone NOT NULL,
    admin_id integer,
    route_id integer
);


ALTER TABLE public.time_table OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 17042)
-- Name: train; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.train (
    train_code integer NOT NULL,
    name character varying NOT NULL,
    off_day character varying NOT NULL,
    route_id integer NOT NULL,
    admin_id integer
);


ALTER TABLE public.train OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 17059)
-- Name: train_class; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.train_class (
    class_code integer NOT NULL,
    train_code integer NOT NULL
);


ALTER TABLE public.train_class OWNER TO postgres;

--
-- TOC entry 5017 (class 0 OID 17014)
-- Dependencies: 217
-- Data for Name: admin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin (admin_id, name, email, salary, user_name, password) FROM stdin;
\.


--
-- TOC entry 5032 (class 0 OID 17193)
-- Dependencies: 232
-- Data for Name: class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.class (class_code, class_name, cost_per_unit) FROM stdin;
1	2nd General	10
2	2nd Mail	15
3	Commuter	20
4	Sulav	35
5	Shovon	45
6	Shovon Chair	50
7	1st Chair/ Seat	90
8	1st Berth	110
9	Snigdha	115
10	AC seat	130
\.


--
-- TOC entry 5033 (class 0 OID 17214)
-- Dependencies: 233
-- Data for Name: distance_storage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.distance_storage (from_station, to_station, distance_unit) FROM stdin;
25	3	11
23	3	16
14	3	21
23	25	3
14	25	18
14	23	13
20	8	3
35	8	9
5	8	15
38	8	21
17	8	22
14	8	23
20	35	1
20	5	2
20	38	3
17	20	8
14	20	5
35	5	1
35	38	2
17	35	5
14	35	7
38	5	1
17	5	3
14	5	7
17	38	2
14	38	1
14	17	2
6	9	1
16	9	5
2	9	8
43	9	8
14	9	9
15	9	10
45	9	10
4	9	9
1	9	7
27	9	7
12	9	6
18	9	3
7	9	25
16	6	1
2	6	4
43	6	8
14	6	8
15	6	4
45	6	9
4	6	10
1	6	13
27	6	15
12	6	1
18	6	4
6	7	24
16	2	1
16	43	2
14	16	5
15	16	1
16	45	1
16	4	3
1	16	5
16	27	8
12	16	4
16	18	4
16	7	16
2	43	1
14	2	3
15	2	3
2	45	3
2	4	6
1	2	7
2	27	10
12	2	9
18	2	9
2	7	16
14	43	1
15	43	1
43	45	3
4	43	7
1	43	8
27	43	10
12	43	10
18	43	10
43	7	14
14	15	1
14	45	2
14	4	5
1	14	8
14	27	8
12	14	10
14	18	11
14	7	12
15	45	1
15	4	3
1	15	4
15	27	8
12	15	4
15	18	2
15	7	10
4	45	1
1	45	3
27	45	5
12	45	8
18	45	5
45	7	9
1	4	1
27	4	3
12	4	5
18	4	7
4	7	8
1	27	1
1	12	3
1	18	3
1	7	7
12	27	1
18	27	3
27	7	7
12	18	1
12	7	5
18	7	1
31	9	2
18	31	5
12	31	3
27	31	4
1	31	4
31	4	2
31	45	2
16	31	2
2	31	4
31	43	4
15	31	7
14	31	9
40	9	26
31	6	2
40	6	19
31	40	11
16	40	9
2	40	17
40	43	18
14	40	15
15	40	10
40	45	9
4	40	6
1	40	2
27	40	2
12	40	4
18	40	3
10	44	6
10	17	1
10	38	7
10	5	13
10	20	20
17	44	4
38	44	8
44	5	13
20	44	14
10	35	17
10	11	18
10	23	23
10	25	22
11	17	17
17	23	16
17	25	11
11	38	12
23	38	13
25	38	9
11	5	8
23	5	11
25	5	8
11	35	3
23	35	7
25	35	3
11	23	2
11	25	7
11	37	22
23	37	17
25	37	15
35	37	8
37	5	9
37	38	4
17	37	1
13	21	5
13	30	4
13	19	14
13	24	18
13	15	22
13	14	24
21	30	3
19	21	5
21	24	14
15	21	19
14	21	7
19	30	3
24	30	4
15	30	13
14	30	6
19	24	4
15	19	4
14	19	15
15	24	4
14	24	1
14	41	3
14	22	3
24	41	1
22	24	2
20	24	4
24	35	5
24	5	8
24	38	11
17	24	15
22	41	2
20	41	2
35	41	3
41	5	5
38	41	7
17	41	15
20	22	1
22	35	2
22	5	3
22	38	4
17	22	9
14	32	20
32	38	8
32	5	1
20	32	1
14	26	6
24	26	23
26	41	3
22	26	9
20	26	5
26	35	3
26	5	2
26	38	1
14	37	23
14	28	24
24	37	20
24	28	23
37	41	20
28	41	21
22	37	15
22	28	20
20	37	12
20	28	17
28	35	11
28	5	8
28	38	8
17	28	5
28	37	1
14	29	21
24	29	21
30	41	5
29	41	18
22	30	9
22	29	17
20	30	6
20	29	9
29	30	6
14	33	25
24	27	20
24	33	24
27	41	17
33	41	21
22	27	8
22	33	18
20	27	4
20	33	6
27	35	5
33	35	5
27	5	3
33	5	5
27	38	3
33	38	3
27	33	1
14	34	19
24	34	18
34	41	16
22	34	12
14	36	24
24	36	21
36	41	10
22	36	7
20	36	3
35	36	2
14	39	14
24	39	13
39	41	3
14	42	26
24	42	21
41	42	19
22	42	15
20	42	15
35	42	13
42	5	10
38	42	3
14	46	21
24	46	22
41	46	19
22	46	20
20	46	16
35	46	12
46	5	12
38	46	5
21	26	5
21	41	17
26	30	2
16	16	11
31	7	15
\.


--
-- TOC entry 5023 (class 0 OID 17071)
-- Dependencies: 223
-- Data for Name: layout; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.layout (layout_id, class_code, train_code, version) FROM stdin;
\.


--
-- TOC entry 5018 (class 0 OID 17021)
-- Dependencies: 218
-- Data for Name: passenger; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.passenger (user_id, name, phone_number, username, password) FROM stdin;
3	1	1	1	$2b$10$.Q6Hq00d06n/EpENutTb9.V/qzCVa7JnmetVKnY53jroWhCMc4L.u
4	1	1	12	$2b$10$ZPxnO.aPdCWVrQphi5XXIua3pUhJfa0R62Nr9Kl2wOZ9ByraQYwG.
5	2	2	2	$2b$10$uwr6Bwligwo4W5eq.as46.VqdRJi4sP1xl/3VEomyDy1QzsQt4EiW
6	3	3	3	$2b$10$FVpbEoRrjArEQu8xKm66feDIuLDDWiBkyzoE.UDdBGmjRP1bTkDZm
\.


--
-- TOC entry 5026 (class 0 OID 17101)
-- Dependencies: 226
-- Data for Name: payment_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_history (payment_id, payment_method, total_payment) FROM stdin;
55	\N	\N
56	\N	\N
57	\N	\N
58	\N	\N
59	\N	\N
61	\N	\N
64	\N	\N
65	\N	\N
\.


--
-- TOC entry 5027 (class 0 OID 17115)
-- Dependencies: 227
-- Data for Name: refund_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refund_history (refund_id, refund_method, refund_date) FROM stdin;
4	\N	\N
5	\N	\N
6	\N	\N
7	\N	\N
8	\N	\N
9	\N	\N
10	\N	\N
15	\N	\N
16	\N	\N
17	\N	\N
19	\N	\N
21	\N	\N
22	\N	\N
23	\N	\N
24	\N	\N
38	\N	\N
39	\N	\N
41	\N	\N
35	\N	\N
36	\N	\N
37	\N	\N
40	\N	\N
11	\N	\N
12	\N	\N
13	\N	\N
14	\N	\N
18	\N	\N
20	\N	\N
25	\N	\N
26	\N	\N
27	\N	\N
28	\N	\N
29	\N	\N
42	\N	\N
43	\N	\N
47	\N	\N
\.


--
-- TOC entry 5020 (class 0 OID 17035)
-- Dependencies: 220
-- Data for Name: route; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.route (route_id, route_name, total_station, order_of_stations) FROM stdin;
120	Dhaka-Dinajpur	9	14 24 41 22 20 35 5 38 17
136	Dinajpur-Dhaka	9	17 38 5 35 20 22 41 24 14
119	Dhaka-Dewangonj	7	14 15 24 19 30 21 13
115	Dewangonj-Dhaka	7	13 21 30 19 24 15 14
148	Noakhali-Dhaka	10	33 27 38 5 35 20 22 41 24 14
128	Dhaka-Noakhali	10	14 24 41 22 20 35 5 38 27 33
108	Chattogram-Sylhet	15	9 6 31 16 2 43 14 15 45 4 1 27 12 18 40
113	Chuadanga-Khulna	3	11 23 25
114	Chuadanga-Saidpur	8	11 23 25 35 5 38 17 37
106	Chattogram-Chandpur	14	9 6 16 2 43 14 15 45 4 1 27 12 18 7
161	Chandpur-Dhaka	12	7 18 12 27 1 4 31 16 2 43 15 14
150	Rajshahi-Chilahati	5	35 5 38 17 10
111	Chilahati-Rajshahi	5	10 17 38 5 35
134	Dhaka-Tarakandi	9	14 24 41 22 20 35 5 38 42
158	Tarakandi-Dhaka	9	42 38 5 35 20 22 41 24 14
142	Khulna-Chilahati	8	25 23 11 35 5 38 17 10
146	Lalmonirhat-Dhaka	11	28 37 17 38 5 35 20 22 41 24 14
139	Ishurdi-Dhaka	5	20 32 5 38 14
121	Dhaka-Ishurdi	5	14 38 5 32 20
138	Ishurdi-Chilahati	6	20 5 38 17 44 10
109	Chilahati-Ishurdi	6	10 44 17 38 5 20
154	Santahar-Dinajpur	3	38 5 17
137	Dinajpur-Santahar	3	17 5 38
131	Dhaka-Rangpur	7	14 24 41 22 20 35 36
153	Rangpur-Dhaka	7	36 35 20 22 41 24 14
132	Dhaka-Sirajgonj	4	14 24 41 39
155	Sirajgonj-Dhaka	4	39 41 24 14
127	Dhaka-Mohangonj	7	14 24 41 22 20 30 29
147	Mohangonj-Dhaka	7	29 30 20 22 41 24 14
125	Dhaka-Laksam	10	14 15 43 2 16 45 31 4 1 27
145	Laksam-Dhaka	10	27 1 4 31 45 16 2 43 15 14
135	Dhaka-Tungipara	9	14 24 41 22 20 35 5 38 46
159	Tungipara-Dhaka	9	46 38 5 35 20 22 41 24 14
105	Chapainawabganj-Dhaka	7	8 20 35 5 38 17 14
117	Dhaka-Chapainawabganj	7	14 17 38 5 35 20 8
129	Dhaka-Panchagarh	5	14 24 41 22 34
149	Panchagarh-Dhaka	5	34 22 41 24 14
116	Dhaka-Benapole	4	14 23 25 3
110	Chilahati-Khulna	8	10 17 38 5 35 11 23 25
126	Dhaka-Lalmonirhat	11	14 24 41 22 20 35 5 38 17 37 28
140	Ishurdi-Rajshahi	2	20 35
152	Rajshahi-Ishurdi	2	35 20
103	Benapole-Dhaka	4	3 25 23 14
160	Dhaka-Tangail	5	14 21 30 26 41
141	Jamalpur-Dhaka	5	21 30 26 41 14
107	Chattogram-Dhaka	13	9 18 12 27 1 4 31 45 16 2 43 15 14
118	Dhaka-Chattogram	13	14 15 43 2 16 45 31 4 1 27 12 18 9
133	Dhaka-Sylhet	13	14 15 43 2 16 45 31 4 1 27 12 18 40
123	Dhaka-Kishoreganj	9	14 24 41 22 20 35 5 38 26
130	Dhaka-Rajshahi	6	14 24 41 22 20 35
143	Kishoreganj-Dhaka	9	26 38 5 35 20 22 41 24 14
151	Rajshahi-Dhaka	6	35 20 22 41 24 14
157	Sylhet-Dhaka	14	40 27 1 4 45 16 15 18 12 6 31 2 43 14
\.


--
-- TOC entry 5030 (class 0 OID 17158)
-- Dependencies: 230
-- Data for Name: route_station; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.route_station (station_id, route_id) FROM stdin;
14	120
24	120
41	120
22	120
20	120
35	120
5	120
38	120
17	120
17	136
38	136
5	136
35	136
20	136
22	136
41	136
24	136
14	136
14	119
15	119
24	119
19	119
30	119
21	119
13	119
13	115
21	115
30	115
19	115
24	115
15	115
14	115
33	148
27	148
38	148
5	148
35	148
20	148
22	148
41	148
24	148
14	148
14	128
24	128
41	128
22	128
20	128
35	128
5	128
38	128
27	128
33	128
9	108
6	108
31	108
16	108
2	108
43	108
14	108
15	108
45	108
4	108
1	108
27	108
12	108
18	108
40	108
11	113
23	113
25	113
11	114
23	114
25	114
35	114
5	114
38	114
17	114
37	114
9	106
6	106
16	106
2	106
43	106
14	106
15	106
45	106
4	106
1	106
27	106
12	106
18	106
7	106
7	161
18	161
12	161
27	161
1	161
4	161
31	161
16	161
2	161
43	161
15	161
14	161
35	150
5	150
38	150
17	150
10	150
10	111
17	111
38	111
5	111
35	111
14	134
24	134
41	134
22	134
20	134
35	134
5	134
38	134
42	134
42	158
38	158
5	158
35	158
20	158
22	158
41	158
24	158
14	158
25	142
23	142
11	142
35	142
5	142
38	142
17	142
10	142
10	110
17	110
38	110
5	110
35	110
11	110
23	110
25	110
14	126
24	126
41	126
22	126
20	126
35	126
5	126
38	126
17	126
37	126
28	126
28	146
37	146
17	146
38	146
5	146
35	146
20	146
22	146
41	146
24	146
14	146
20	140
35	140
35	152
20	152
20	139
32	139
5	139
38	139
14	139
14	121
38	121
5	121
32	121
20	121
20	138
5	138
38	138
17	138
44	138
10	138
10	109
44	109
17	109
38	109
5	109
20	109
38	154
5	154
17	154
17	137
5	137
38	137
14	131
24	131
41	131
22	131
20	131
35	131
36	131
36	153
35	153
20	153
22	153
41	153
24	153
14	153
14	132
24	132
41	132
39	132
39	155
41	155
24	155
14	155
14	127
24	127
41	127
22	127
20	127
30	127
29	127
29	147
30	147
20	147
22	147
41	147
24	147
14	147
14	125
15	125
43	125
2	125
16	125
45	125
31	125
4	125
1	125
27	125
27	145
1	145
4	145
31	145
45	145
16	145
2	145
43	145
15	145
14	145
14	135
24	135
41	135
22	135
20	135
35	135
5	135
38	135
46	135
46	159
38	159
5	159
35	159
20	159
22	159
41	159
24	159
14	159
8	105
20	105
35	105
5	105
38	105
17	105
14	105
14	117
17	117
38	117
5	117
35	117
20	117
8	117
14	129
24	129
41	129
22	129
34	129
34	149
22	149
41	149
24	149
14	149
14	116
23	116
25	116
3	116
3	103
25	103
23	103
14	103
14	160
21	160
30	160
26	160
41	160
21	141
30	141
26	141
41	141
14	141
40	157
27	157
1	157
4	157
45	157
16	157
15	157
18	157
12	157
6	157
31	157
2	157
43	157
14	157
9	107
18	107
12	107
27	107
1	107
4	107
31	107
45	107
16	107
2	107
43	107
15	107
14	107
14	118
15	118
43	118
2	118
16	118
45	118
31	118
4	118
1	118
27	118
12	118
18	118
9	118
14	133
15	133
43	133
2	133
16	133
45	133
31	133
4	133
1	133
27	133
12	133
18	133
40	133
14	123
24	123
41	123
22	123
20	123
35	123
5	123
38	123
26	123
14	130
24	130
41	130
22	130
20	130
35	130
26	143
38	143
5	143
35	143
20	143
22	143
41	143
24	143
14	143
35	151
20	151
22	151
41	151
24	151
14	151
\.


--
-- TOC entry 5024 (class 0 OID 17081)
-- Dependencies: 224
-- Data for Name: seat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seat (total_seat, class_code, train_code) FROM stdin;
48	3	701
50	2	701
44	7	701
44	1	701
48	9	701
52	8	701
44	10	701
47	6	701
60	5	702
35	3	702
52	2	702
43	4	702
51	8	702
53	9	702
46	6	702
46	1	702
43	10	702
40	1	705
43	8	705
40	3	705
53	5	705
41	7	705
40	4	705
55	10	705
48	9	705
46	6	705
40	3	706
42	7	706
45	8	706
53	10	706
41	6	706
50	4	706
50	9	706
45	5	706
46	1	706
57	2	706
55	2	707
44	8	707
46	9	707
41	10	707
44	6	707
49	1	707
43	7	707
36	3	707
52	8	708
56	5	708
53	2	708
34	7	708
45	3	708
56	10	708
42	4	708
42	6	708
40	1	708
49	1	709
48	3	709
52	10	709
57	2	709
53	9	709
36	7	709
59	5	709
46	6	709
52	4	709
44	8	709
53	2	710
42	8	710
41	7	710
37	3	710
39	9	710
53	5	710
47	4	710
50	10	711
35	7	711
38	3	711
43	9	711
47	8	711
46	1	711
48	6	711
42	4	711
50	5	711
50	2	711
53	9	712
55	5	712
48	1	712
52	2	712
51	8	712
42	6	712
34	3	712
50	4	712
45	10	712
44	1	718
39	7	718
42	8	718
38	6	718
49	5	718
39	9	718
50	4	718
40	7	719
47	1	719
54	8	719
47	9	719
56	2	719
51	4	719
48	5	719
58	5	721
48	7	721
39	4	721
49	8	721
40	6	721
51	9	721
46	1	721
52	8	722
55	2	722
37	3	722
44	7	722
57	5	722
53	6	722
55	10	722
47	4	723
44	6	723
60	5	723
43	1	723
57	2	723
44	3	723
54	9	723
39	7	723
38	3	726
39	9	726
42	7	726
54	8	726
45	10	726
47	1	726
53	5	726
52	2	726
46	6	727
48	2	727
50	1	727
41	4	727
59	5	727
54	8	727
46	10	727
38	7	727
40	9	727
52	2	728
42	6	728
48	4	728
43	3	728
42	10	728
37	7	728
49	8	728
47	1	728
60	5	728
54	9	728
42	4	731
50	6	731
42	9	731
54	8	731
60	5	731
44	3	731
33	7	731
42	2	731
50	2	732
34	7	732
38	3	732
52	1	732
52	4	732
47	10	732
57	5	732
53	9	732
45	8	732
43	6	732
46	9	733
40	1	733
56	10	733
36	7	733
45	8	733
45	5	733
47	4	733
45	3	733
38	6	733
51	8	734
48	4	734
48	1	734
46	5	734
44	2	734
48	9	734
46	7	734
51	10	734
43	3	734
49	6	734
47	1	737
55	5	737
43	2	737
38	7	737
39	6	737
45	8	737
49	10	737
53	10	739
54	1	739
53	4	739
50	5	739
38	3	739
52	6	739
37	7	739
38	7	750
54	10	750
52	9	750
46	8	750
53	5	750
51	2	750
41	4	750
49	2	751
39	1	751
50	9	751
48	3	751
45	5	751
47	4	751
55	10	751
50	6	751
59	5	752
43	3	752
50	4	752
44	2	752
46	1	752
46	9	752
44	10	752
41	7	752
51	1	753
49	5	753
45	6	753
45	9	753
44	8	753
46	2	753
41	4	753
34	7	753
48	8	754
45	4	754
54	5	754
56	10	754
50	2	754
44	1	754
40	9	754
49	10	755
51	9	755
48	7	755
34	3	755
48	8	755
46	2	755
53	6	755
52	2	756
50	8	756
47	3	756
50	4	756
50	10	756
41	7	756
54	9	756
47	5	756
53	5	759
34	7	759
52	9	759
45	1	759
40	8	759
51	10	759
39	6	759
40	6	760
47	10	760
47	2	760
51	8	760
48	1	760
53	5	760
41	3	760
40	8	761
44	1	761
50	6	761
44	3	761
53	4	761
49	9	761
47	10	761
36	7	761
47	2	761
45	5	761
43	1	762
56	5	762
47	9	762
50	4	762
51	8	762
49	10	762
47	3	762
54	2	762
42	4	763
43	9	763
60	5	763
40	3	763
44	6	763
41	7	763
52	2	763
44	1	763
55	8	764
41	7	764
54	9	764
50	4	764
38	6	764
54	5	764
46	10	764
46	1	764
42	4	765
46	7	765
46	6	765
43	10	765
45	2	765
57	5	765
40	1	765
39	9	765
47	8	766
41	7	766
48	1	766
43	4	766
43	10	766
45	6	766
51	5	766
55	2	766
34	3	766
43	9	769
41	8	769
42	7	769
48	5	769
40	1	769
44	2	769
44	6	769
41	10	770
52	4	770
47	8	770
56	5	770
41	7	770
44	9	770
55	2	770
45	1	770
52	6	770
40	3	770
54	8	771
53	9	771
41	3	771
46	4	771
47	2	771
47	10	771
38	6	771
49	5	771
43	7	771
45	1	771
53	2	772
44	4	772
53	6	772
51	9	772
46	10	772
44	1	772
53	8	772
48	4	773
45	9	773
46	1	773
53	10	773
52	8	773
37	7	773
51	5	773
57	5	774
42	2	774
41	4	774
42	9	774
51	8	774
38	3	774
39	7	774
53	1	774
50	6	774
48	10	774
44	6	775
40	3	775
45	8	775
47	10	775
49	4	775
56	5	775
46	2	775
39	1	776
41	9	776
42	2	776
37	3	776
47	10	776
39	4	776
34	7	776
46	6	776
58	5	776
56	2	777
40	6	777
46	8	777
45	7	777
49	1	777
49	5	777
49	10	777
36	3	777
40	4	777
54	9	777
45	9	778
41	6	778
55	2	778
55	10	778
42	8	778
43	3	778
46	5	778
52	1	778
46	3	781
53	5	781
51	9	781
41	1	781
50	4	781
33	7	781
56	10	781
46	10	782
50	5	782
48	1	782
49	3	782
47	7	782
55	8	782
40	6	782
44	2	782
38	4	782
43	9	782
57	2	787
40	4	787
49	8	787
47	1	787
36	3	787
50	10	787
38	7	787
49	9	787
49	5	787
44	6	787
39	1	788
43	8	788
54	2	788
42	6	788
39	9	788
36	3	788
40	4	788
56	5	788
48	7	788
43	10	788
47	10	789
44	4	789
40	9	789
44	6	789
58	5	789
47	8	789
45	3	789
40	3	790
42	8	790
43	7	790
45	2	790
44	4	790
55	5	790
42	9	790
44	3	791
44	8	791
44	9	791
46	2	791
39	1	791
46	6	791
55	10	791
53	4	791
43	1	792
42	2	792
39	7	792
48	4	792
60	5	792
42	10	792
38	3	792
51	8	793
43	2	793
44	10	793
53	5	793
44	9	793
49	1	793
35	7	793
54	8	794
52	5	794
43	6	794
41	7	794
45	4	794
39	3	794
49	9	794
51	2	794
39	9	795
49	5	795
48	2	795
38	3	795
48	7	795
49	10	795
50	8	795
46	1	795
38	6	795
46	4	795
47	4	796
48	3	796
42	1	796
39	7	796
42	8	796
50	10	796
45	2	796
49	9	796
46	6	796
58	5	796
46	3	800
47	8	800
34	7	800
52	2	800
47	6	800
54	10	800
47	9	800
42	3	703
39	7	703
52	9	703
46	6	703
49	1	703
48	8	703
42	2	703
46	10	703
46	4	703
52	5	703
52	6	704
50	10	704
55	2	704
49	8	704
54	9	704
51	1	704
45	4	704
50	6	717
44	1	717
49	8	717
60	5	717
53	2	717
48	3	717
41	10	717
45	9	717
42	4	717
47	7	717
44	10	729
52	8	729
46	3	729
38	4	729
46	6	729
52	9	729
45	7	729
45	2	729
54	5	729
47	1	729
53	10	735
41	4	735
56	2	735
51	1	735
50	5	735
50	9	735
43	3	735
50	6	735
39	1	736
43	6	736
51	4	736
50	10	736
40	8	736
48	7	736
47	9	736
46	2	736
60	5	736
49	3	736
51	2	738
40	9	738
39	3	738
52	4	738
39	6	738
54	8	738
43	10	738
46	3	740
50	4	740
40	8	740
44	6	740
38	7	740
45	5	740
41	10	740
56	2	740
44	1	740
34	7	741
52	8	741
45	10	741
52	5	741
42	3	741
44	2	741
40	6	741
38	4	741
50	4	742
45	10	742
54	9	742
44	2	742
53	8	742
50	6	742
47	5	742
43	3	743
52	4	743
48	2	743
49	10	743
56	5	743
48	8	743
42	6	743
47	1	743
51	4	744
41	3	744
53	1	744
51	5	744
51	10	744
41	7	744
46	2	744
45	8	745
51	9	745
37	3	745
51	2	745
38	7	745
50	10	745
55	5	745
45	6	746
41	9	746
47	3	746
42	7	746
41	4	746
52	1	746
42	8	746
49	5	746
51	6	747
53	10	747
39	4	747
34	3	747
42	7	747
45	9	747
53	5	747
44	8	747
49	1	747
43	2	747
49	9	748
40	6	748
54	10	748
37	3	748
43	1	748
44	8	748
48	4	748
52	5	748
41	8	749
43	6	749
48	2	749
48	7	749
54	1	749
42	3	749
48	4	749
46	10	749
49	5	749
47	5	757
46	2	757
50	10	757
40	1	757
43	3	757
39	9	757
33	7	757
46	4	758
59	5	758
44	6	758
55	8	758
39	3	758
53	2	758
48	10	758
41	1	758
52	9	758
52	9	767
41	3	767
48	8	767
45	7	767
53	5	767
47	6	767
50	1	767
54	2	767
49	10	767
52	4	767
50	2	768
52	4	768
49	5	768
51	10	768
45	1	768
36	7	768
40	3	768
54	9	768
38	6	768
46	6	779
46	8	779
51	2	779
49	3	779
41	7	779
53	10	779
53	9	779
41	1	779
51	5	779
45	3	780
49	1	780
49	2	780
50	9	780
41	6	780
47	5	780
50	8	780
46	2	783
49	1	783
51	10	783
43	6	783
51	4	783
55	8	783
43	9	783
60	5	783
41	8	784
52	1	784
46	2	784
46	7	784
44	10	784
42	6	784
43	4	784
39	1	785
40	6	785
54	10	785
47	4	785
52	5	785
47	3	785
46	2	785
44	6	786
54	8	786
41	9	786
51	10	786
35	7	786
50	1	786
46	5	786
52	2	786
38	4	786
\.


--
-- TOC entry 5029 (class 0 OID 17146)
-- Dependencies: 229
-- Data for Name: seat_coordinate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seat_coordinate (layout_id, seat_name, x_coordinate, y_coordinate) FROM stdin;
\.


--
-- TOC entry 5028 (class 0 OID 17129)
-- Dependencies: 228
-- Data for Name: seat_reservation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seat_reservation (ticket_id, seat_number, class_code, train_code, from_station, to_station, date) FROM stdin;
57	1	1	719	14	18	2025-07-20
57	2	1	719	14	18	2025-07-20
58	3	1	719	14	18	2025-07-20
58	4	1	719	14	18	2025-07-20
58	5	1	719	14	18	2025-07-20
59	1	1	702	2	9	2025-07-20
59	2	1	702	2	9	2025-07-20
61	1	4	742	2	9	2025-07-23
64	33	1	702	43	18	2025-09-01
64	41	1	702	43	18	2025-09-01
64	23	1	702	43	18	2025-09-01
65	11	1	702	14	9	2025-07-25
65	12	1	702	14	9	2025-07-25
\.


--
-- TOC entry 5019 (class 0 OID 17028)
-- Dependencies: 219
-- Data for Name: station; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.station (station_id, station_name, location, zone, post_code) FROM stdin;
1	Akhaura	\N	\N	\N
2	Banani	\N	\N	\N
3	Benapole	\N	\N	\N
4	Bhairab_Bazar	\N	\N	\N
5	Bogura	\N	\N	\N
6	Brahmanbaria	\N	\N	\N
7	Chandpur	\N	\N	\N
8	Chapainawabganj	\N	\N	\N
9	Chattogram	\N	\N	\N
10	Chilahati	\N	\N	\N
11	Chuadanga	\N	\N	\N
12	Comilla	\N	\N	\N
13	Dewanganj	\N	\N	\N
14	Dhaka	\N	\N	\N
15	Dhaka_Airport	\N	\N	\N
16	Dhaka_Cantonment	\N	\N	\N
17	Dinajpur	\N	\N	\N
18	Feni	\N	\N	\N
19	Gafargaon	\N	\N	\N
20	Ishwardi	\N	\N	\N
21	Jamalpur	\N	\N	\N
22	Jamuna_Bridge_East	\N	\N	\N
23	Jessore	\N	\N	\N
24	Joydebpur	\N	\N	\N
25	Khulna	\N	\N	\N
26	Kishoreganj	\N	\N	\N
27	Laksam	\N	\N	\N
28	Lalmonirhat	\N	\N	\N
29	Mohangonj	\N	\N	\N
30	Mymensingh	\N	\N	\N
31	Narsingdi	\N	\N	\N
32	Natore	\N	\N	\N
33	Noakhali	\N	\N	\N
34	Panchagarh	\N	\N	\N
35	Rajshahi	\N	\N	\N
36	Rangpur	\N	\N	\N
37	Saidpur	\N	\N	\N
38	Santahar	\N	\N	\N
39	Sirajgonj	\N	\N	\N
40	Sylhet	\N	\N	\N
41	Tangail	\N	\N	\N
42	Tarakandi	\N	\N	\N
43	Tejgaon	\N	\N	\N
44	Thakurgaon	\N	\N	\N
45	Tongi	\N	\N	\N
46	Tungipara	\N	\N	\N
\.


--
-- TOC entry 5025 (class 0 OID 17091)
-- Dependencies: 225
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ticket (ticket_id, total_cost, user_id) FROM stdin;
55	220	3
56	220	5
57	220	3
58	330	5
59	160	6
61	280	3
64	300	3
65	180	3
\.


--
-- TOC entry 5031 (class 0 OID 17173)
-- Dependencies: 231
-- Data for Name: time_table; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.time_table (train_code, station_id, arrival_time, departure_time, admin_id, route_id) FROM stdin;
701	9	20:30:00	20:35:00	\N	107
701	18	21:05:00	21:10:00	\N	107
701	12	21:40:00	21:45:00	\N	107
701	27	22:15:00	22:20:00	\N	107
701	1	22:50:00	22:55:00	\N	107
701	4	23:25:00	23:30:00	\N	107
701	31	00:00:00	00:05:00	\N	107
701	45	00:35:00	00:40:00	\N	107
701	16	01:10:00	01:15:00	\N	107
701	2	01:45:00	01:50:00	\N	107
701	43	02:20:00	02:25:00	\N	107
701	15	02:55:00	03:00:00	\N	107
701	14	03:30:00	00:00:00	\N	107
702	14	13:30:00	13:35:00	\N	118
702	15	14:05:00	14:10:00	\N	118
702	43	14:40:00	14:45:00	\N	118
702	2	15:15:00	15:20:00	\N	118
702	16	15:50:00	15:55:00	\N	118
702	45	16:25:00	16:30:00	\N	118
702	31	17:00:00	17:05:00	\N	118
702	4	17:35:00	17:40:00	\N	118
702	1	18:10:00	18:15:00	\N	118
702	27	18:45:00	18:50:00	\N	118
702	12	19:20:00	19:25:00	\N	118
702	18	19:55:00	20:00:00	\N	118
702	9	20:30:00	00:00:00	\N	118
705	14	13:00:00	13:05:00	\N	120
705	24	13:35:00	13:40:00	\N	120
705	41	14:10:00	14:15:00	\N	120
705	22	14:45:00	14:50:00	\N	120
705	20	15:20:00	15:25:00	\N	120
705	35	15:55:00	16:00:00	\N	120
705	5	16:30:00	16:35:00	\N	120
705	38	17:05:00	17:10:00	\N	120
705	17	17:40:00	00:00:00	\N	120
706	17	14:30:00	14:35:00	\N	136
706	38	15:05:00	15:10:00	\N	136
706	5	15:40:00	15:45:00	\N	136
706	35	16:15:00	16:20:00	\N	136
706	20	16:50:00	16:55:00	\N	136
706	22	17:25:00	17:30:00	\N	136
706	41	18:00:00	18:05:00	\N	136
706	24	18:35:00	18:40:00	\N	136
706	14	19:10:00	00:00:00	\N	136
707	14	20:00:00	20:05:00	\N	119
707	15	20:35:00	20:40:00	\N	119
707	24	21:10:00	21:15:00	\N	119
707	19	21:45:00	21:50:00	\N	119
707	30	22:20:00	22:25:00	\N	119
707	21	22:55:00	23:00:00	\N	119
707	13	23:30:00	00:00:00	\N	119
708	13	14:30:00	14:35:00	\N	115
708	21	15:05:00	15:10:00	\N	115
708	30	15:40:00	15:45:00	\N	115
708	19	16:15:00	16:20:00	\N	115
708	24	16:50:00	16:55:00	\N	115
708	15	17:25:00	17:30:00	\N	115
708	14	18:00:00	00:00:00	\N	115
709	14	03:00:00	03:05:00	\N	133
709	15	03:35:00	03:40:00	\N	133
709	43	04:10:00	04:15:00	\N	133
709	2	04:45:00	04:50:00	\N	133
709	16	05:20:00	05:25:00	\N	133
709	45	05:55:00	06:00:00	\N	133
709	31	06:30:00	06:35:00	\N	133
709	4	07:05:00	07:10:00	\N	133
709	1	07:40:00	07:45:00	\N	133
709	27	08:15:00	08:20:00	\N	133
709	12	08:50:00	08:55:00	\N	133
709	18	09:25:00	09:30:00	\N	133
709	40	10:00:00	00:00:00	\N	133
710	40	09:30:00	09:35:00	\N	157
710	27	10:05:00	10:10:00	\N	157
710	1	10:40:00	10:45:00	\N	157
710	4	11:15:00	11:20:00	\N	157
710	45	11:50:00	11:55:00	\N	157
710	16	12:25:00	12:30:00	\N	157
710	15	13:00:00	13:05:00	\N	157
710	18	13:35:00	13:40:00	\N	157
710	12	14:10:00	14:15:00	\N	157
710	6	14:45:00	14:50:00	\N	157
710	31	15:20:00	15:25:00	\N	157
710	2	15:55:00	16:00:00	\N	157
710	43	16:30:00	16:35:00	\N	157
710	14	17:05:00	00:00:00	\N	157
711	33	03:00:00	03:05:00	\N	148
711	27	03:35:00	03:40:00	\N	148
711	38	04:10:00	04:15:00	\N	148
711	5	04:45:00	04:50:00	\N	148
711	35	05:20:00	05:25:00	\N	148
711	20	05:55:00	06:00:00	\N	148
711	22	06:30:00	06:35:00	\N	148
711	41	07:05:00	07:10:00	\N	148
711	24	07:40:00	07:45:00	\N	148
711	14	08:15:00	00:00:00	\N	148
712	14	00:00:00	00:05:00	\N	128
712	24	00:35:00	00:40:00	\N	128
712	41	01:10:00	01:15:00	\N	128
712	22	01:45:00	01:50:00	\N	128
712	20	02:20:00	02:25:00	\N	128
712	35	02:55:00	03:00:00	\N	128
712	5	03:30:00	03:35:00	\N	128
712	38	04:05:00	04:10:00	\N	128
712	27	04:40:00	04:45:00	\N	128
712	33	05:15:00	00:00:00	\N	128
718	40	08:30:00	08:35:00	\N	157
718	27	09:05:00	09:10:00	\N	157
718	1	09:40:00	09:45:00	\N	157
718	4	10:15:00	10:20:00	\N	157
718	45	10:50:00	10:55:00	\N	157
718	16	11:25:00	11:30:00	\N	157
718	15	12:00:00	12:05:00	\N	157
718	18	12:35:00	12:40:00	\N	157
718	12	13:10:00	13:15:00	\N	157
718	6	13:45:00	13:50:00	\N	157
718	31	14:20:00	14:25:00	\N	157
718	2	14:55:00	15:00:00	\N	157
718	43	15:30:00	15:35:00	\N	157
718	14	16:05:00	00:00:00	\N	157
719	9	14:30:00	14:35:00	\N	108
719	6	15:05:00	15:10:00	\N	108
719	31	15:40:00	15:45:00	\N	108
719	16	16:15:00	16:20:00	\N	108
719	2	16:50:00	16:55:00	\N	108
719	43	17:25:00	17:30:00	\N	108
719	14	18:00:00	18:05:00	\N	108
719	15	18:35:00	18:40:00	\N	108
719	45	19:10:00	19:15:00	\N	108
719	4	19:45:00	19:50:00	\N	108
719	1	20:20:00	20:25:00	\N	108
719	27	20:55:00	21:00:00	\N	108
719	12	21:30:00	21:35:00	\N	108
719	18	22:05:00	22:10:00	\N	108
719	40	22:40:00	00:00:00	\N	108
721	9	07:00:00	07:05:00	\N	107
721	18	07:35:00	07:40:00	\N	107
721	12	08:10:00	08:15:00	\N	107
721	27	08:45:00	08:50:00	\N	107
721	1	09:20:00	09:25:00	\N	107
721	4	09:55:00	10:00:00	\N	107
721	31	10:30:00	10:35:00	\N	107
721	45	11:05:00	11:10:00	\N	107
721	16	11:40:00	11:45:00	\N	107
721	2	12:15:00	12:20:00	\N	107
721	43	12:50:00	12:55:00	\N	107
721	15	13:25:00	13:30:00	\N	107
721	14	14:00:00	00:00:00	\N	107
722	14	07:00:00	07:05:00	\N	118
722	15	07:35:00	07:40:00	\N	118
722	43	08:10:00	08:15:00	\N	118
722	2	08:45:00	08:50:00	\N	118
722	16	09:20:00	09:25:00	\N	118
722	45	09:55:00	10:00:00	\N	118
722	31	10:30:00	10:35:00	\N	118
722	4	11:05:00	11:10:00	\N	118
722	1	11:40:00	11:45:00	\N	118
722	27	12:15:00	12:20:00	\N	118
722	12	12:50:00	12:55:00	\N	118
722	18	13:25:00	13:30:00	\N	118
722	9	14:00:00	00:00:00	\N	118
723	9	18:00:00	18:05:00	\N	108
723	6	18:35:00	18:40:00	\N	108
723	31	19:10:00	19:15:00	\N	108
723	16	19:45:00	19:50:00	\N	108
723	2	20:20:00	20:25:00	\N	108
723	43	20:55:00	21:00:00	\N	108
723	14	21:30:00	21:35:00	\N	108
723	15	22:05:00	22:10:00	\N	108
723	45	22:40:00	22:45:00	\N	108
723	4	23:15:00	23:20:00	\N	108
723	1	23:50:00	23:55:00	\N	108
723	27	00:25:00	00:30:00	\N	108
723	12	01:00:00	01:05:00	\N	108
723	18	01:35:00	01:40:00	\N	108
723	40	02:10:00	00:00:00	\N	108
726	11	13:30:00	13:35:00	\N	113
726	23	14:05:00	14:10:00	\N	113
726	25	14:40:00	00:00:00	\N	113
727	11	01:30:00	01:35:00	\N	114
727	23	02:05:00	02:10:00	\N	114
727	25	02:40:00	02:45:00	\N	114
727	35	03:15:00	03:20:00	\N	114
727	5	03:50:00	03:55:00	\N	114
727	38	04:25:00	04:30:00	\N	114
727	17	05:00:00	05:05:00	\N	114
727	37	05:35:00	00:00:00	\N	114
728	11	13:00:00	13:05:00	\N	113
728	23	13:35:00	13:40:00	\N	113
728	25	14:10:00	00:00:00	\N	113
731	35	09:30:00	09:35:00	\N	150
731	5	10:05:00	10:10:00	\N	150
731	38	10:40:00	10:45:00	\N	150
731	17	11:15:00	11:20:00	\N	150
731	10	11:50:00	00:00:00	\N	150
732	10	20:00:00	20:05:00	\N	111
732	17	20:35:00	20:40:00	\N	111
732	38	21:10:00	21:15:00	\N	111
732	5	21:45:00	21:50:00	\N	111
732	35	22:20:00	00:00:00	\N	111
733	35	20:30:00	20:35:00	\N	150
733	5	21:05:00	21:10:00	\N	150
733	38	21:40:00	21:45:00	\N	150
733	17	22:15:00	22:20:00	\N	150
733	10	22:50:00	00:00:00	\N	150
734	10	04:30:00	04:35:00	\N	111
734	17	05:05:00	05:10:00	\N	111
734	38	05:40:00	05:45:00	\N	111
734	5	06:15:00	06:20:00	\N	111
734	35	06:50:00	00:00:00	\N	111
737	14	04:00:00	04:05:00	\N	123
737	24	04:35:00	04:40:00	\N	123
737	41	05:10:00	05:15:00	\N	123
737	22	05:45:00	05:50:00	\N	123
737	20	06:20:00	06:25:00	\N	123
737	35	06:55:00	07:00:00	\N	123
737	5	07:30:00	07:35:00	\N	123
737	38	08:05:00	08:10:00	\N	123
737	26	08:40:00	00:00:00	\N	123
739	14	19:00:00	19:05:00	\N	133
739	15	19:35:00	19:40:00	\N	133
739	43	20:10:00	20:15:00	\N	133
739	2	20:45:00	20:50:00	\N	133
739	16	21:20:00	21:25:00	\N	133
739	45	21:55:00	22:00:00	\N	133
739	31	22:30:00	22:35:00	\N	133
739	4	23:05:00	23:10:00	\N	133
739	1	23:40:00	23:45:00	\N	133
739	27	00:15:00	00:20:00	\N	133
739	12	00:50:00	00:55:00	\N	133
739	18	01:25:00	01:30:00	\N	133
739	40	02:00:00	00:00:00	\N	133
750	26	18:00:00	18:05:00	\N	143
750	38	18:35:00	18:40:00	\N	143
750	5	19:10:00	19:15:00	\N	143
750	35	19:45:00	19:50:00	\N	143
750	20	20:20:00	20:25:00	\N	143
750	22	20:55:00	21:00:00	\N	143
750	41	21:30:00	21:35:00	\N	143
750	24	22:05:00	22:10:00	\N	143
750	14	22:40:00	00:00:00	\N	143
751	14	06:00:00	06:05:00	\N	126
751	24	06:35:00	06:40:00	\N	126
751	41	07:10:00	07:15:00	\N	126
751	22	07:45:00	07:50:00	\N	126
751	20	08:20:00	08:25:00	\N	126
751	35	08:55:00	09:00:00	\N	126
751	5	09:30:00	09:35:00	\N	126
751	38	10:05:00	10:10:00	\N	126
751	17	10:40:00	10:45:00	\N	126
751	37	11:15:00	11:20:00	\N	126
751	28	11:50:00	00:00:00	\N	126
752	28	06:30:00	06:35:00	\N	146
752	37	07:05:00	07:10:00	\N	146
752	17	07:40:00	07:45:00	\N	146
752	38	08:15:00	08:20:00	\N	146
752	5	08:50:00	08:55:00	\N	146
752	35	09:25:00	09:30:00	\N	146
752	20	10:00:00	10:05:00	\N	146
752	22	10:35:00	10:40:00	\N	146
752	41	11:10:00	11:15:00	\N	146
752	24	11:45:00	11:50:00	\N	146
752	14	12:20:00	00:00:00	\N	146
753	14	04:00:00	04:05:00	\N	130
753	24	04:35:00	04:40:00	\N	130
753	41	05:10:00	05:15:00	\N	130
753	22	05:45:00	05:50:00	\N	130
753	20	06:20:00	06:25:00	\N	130
753	35	06:55:00	00:00:00	\N	130
754	35	11:00:00	11:05:00	\N	151
754	20	11:35:00	11:40:00	\N	151
754	22	12:10:00	12:15:00	\N	151
754	41	12:45:00	12:50:00	\N	151
754	24	13:20:00	13:25:00	\N	151
754	14	13:55:00	00:00:00	\N	151
755	20	17:30:00	17:35:00	\N	140
755	35	18:05:00	00:00:00	\N	140
756	35	10:00:00	10:05:00	\N	152
756	20	10:35:00	00:00:00	\N	152
759	14	11:30:00	11:35:00	\N	130
759	24	12:05:00	12:10:00	\N	130
759	41	12:40:00	12:45:00	\N	130
759	22	13:15:00	13:20:00	\N	130
759	20	13:50:00	13:55:00	\N	130
759	35	14:25:00	00:00:00	\N	130
760	35	11:30:00	11:35:00	\N	151
760	20	12:05:00	12:10:00	\N	151
760	22	12:40:00	12:45:00	\N	151
760	41	13:15:00	13:20:00	\N	151
760	24	13:50:00	13:55:00	\N	151
760	14	14:25:00	00:00:00	\N	151
761	20	07:00:00	07:05:00	\N	140
761	35	07:35:00	00:00:00	\N	140
762	35	03:30:00	03:35:00	\N	152
762	20	04:05:00	00:00:00	\N	152
763	20	15:00:00	15:05:00	\N	139
763	32	15:35:00	15:40:00	\N	139
763	5	16:10:00	16:15:00	\N	139
763	38	16:45:00	16:50:00	\N	139
763	14	17:20:00	00:00:00	\N	139
764	14	13:00:00	13:05:00	\N	121
764	38	13:35:00	13:40:00	\N	121
764	5	14:10:00	14:15:00	\N	121
764	32	14:45:00	14:50:00	\N	121
764	20	15:20:00	00:00:00	\N	121
765	20	15:30:00	15:35:00	\N	138
765	5	16:05:00	16:10:00	\N	138
765	38	16:40:00	16:45:00	\N	138
765	17	17:15:00	17:20:00	\N	138
765	44	17:50:00	17:55:00	\N	138
765	10	18:25:00	00:00:00	\N	138
766	10	16:30:00	16:35:00	\N	109
766	44	17:05:00	17:10:00	\N	109
766	17	17:40:00	17:45:00	\N	109
766	38	18:15:00	18:20:00	\N	109
766	5	18:50:00	18:55:00	\N	109
766	20	19:25:00	00:00:00	\N	109
769	14	19:30:00	19:35:00	\N	130
769	24	20:05:00	20:10:00	\N	130
769	41	20:40:00	20:45:00	\N	130
769	22	21:15:00	21:20:00	\N	130
769	20	21:50:00	21:55:00	\N	130
769	35	22:25:00	00:00:00	\N	130
770	35	07:00:00	07:05:00	\N	151
770	20	07:35:00	07:40:00	\N	151
770	22	08:10:00	08:15:00	\N	151
770	41	08:45:00	08:50:00	\N	151
770	24	09:20:00	09:25:00	\N	151
770	14	09:55:00	00:00:00	\N	151
771	14	09:30:00	09:35:00	\N	131
771	24	10:05:00	10:10:00	\N	131
771	41	10:40:00	10:45:00	\N	131
771	22	11:15:00	11:20:00	\N	131
771	20	11:50:00	11:55:00	\N	131
771	35	12:25:00	12:30:00	\N	131
771	36	13:00:00	00:00:00	\N	131
772	36	10:00:00	10:05:00	\N	153
772	35	10:35:00	10:40:00	\N	153
772	20	11:10:00	11:15:00	\N	153
772	22	11:45:00	11:50:00	\N	153
772	41	12:20:00	12:25:00	\N	153
772	24	12:55:00	13:00:00	\N	153
772	14	13:30:00	00:00:00	\N	153
773	14	21:00:00	21:05:00	\N	133
773	15	21:35:00	21:40:00	\N	133
773	43	22:10:00	22:15:00	\N	133
773	2	22:45:00	22:50:00	\N	133
773	16	23:20:00	23:25:00	\N	133
773	45	23:55:00	00:00:00	\N	133
773	31	00:30:00	00:35:00	\N	133
773	4	01:05:00	01:10:00	\N	133
773	1	01:40:00	01:45:00	\N	133
773	27	02:15:00	02:20:00	\N	133
773	12	02:50:00	02:55:00	\N	133
773	18	03:25:00	03:30:00	\N	133
773	40	04:00:00	00:00:00	\N	133
774	40	18:30:00	18:35:00	\N	157
774	27	19:05:00	19:10:00	\N	157
774	1	19:40:00	19:45:00	\N	157
774	4	20:15:00	20:20:00	\N	157
774	45	20:50:00	20:55:00	\N	157
774	16	21:25:00	21:30:00	\N	157
774	15	22:00:00	22:05:00	\N	157
774	18	22:35:00	22:40:00	\N	157
774	12	23:10:00	23:15:00	\N	157
774	6	23:45:00	23:50:00	\N	157
774	31	00:20:00	00:25:00	\N	157
774	2	00:55:00	01:00:00	\N	157
774	43	01:30:00	01:35:00	\N	157
774	14	02:05:00	00:00:00	\N	157
775	14	17:00:00	17:05:00	\N	132
775	24	17:35:00	17:40:00	\N	132
775	41	18:10:00	18:15:00	\N	132
775	39	18:45:00	00:00:00	\N	132
776	39	18:30:00	18:35:00	\N	155
776	41	19:05:00	19:10:00	\N	155
776	24	19:40:00	19:45:00	\N	155
776	14	20:15:00	00:00:00	\N	155
777	14	15:00:00	15:05:00	\N	127
777	24	15:35:00	15:40:00	\N	127
777	41	16:10:00	16:15:00	\N	127
777	22	16:45:00	16:50:00	\N	127
777	20	17:20:00	17:25:00	\N	127
777	30	17:55:00	18:00:00	\N	127
777	29	18:30:00	00:00:00	\N	127
778	29	15:00:00	15:05:00	\N	147
778	30	15:35:00	15:40:00	\N	147
778	20	16:10:00	16:15:00	\N	147
778	22	16:45:00	16:50:00	\N	147
778	41	17:20:00	17:25:00	\N	147
778	24	17:55:00	18:00:00	\N	147
778	14	18:30:00	00:00:00	\N	147
781	14	02:00:00	02:05:00	\N	123
781	24	02:35:00	02:40:00	\N	123
781	41	03:10:00	03:15:00	\N	123
781	22	03:45:00	03:50:00	\N	123
781	20	04:20:00	04:25:00	\N	123
781	35	04:55:00	05:00:00	\N	123
781	5	05:30:00	05:35:00	\N	123
781	38	06:05:00	06:10:00	\N	123
781	26	06:40:00	00:00:00	\N	123
782	26	23:00:00	23:05:00	\N	143
782	38	23:35:00	23:40:00	\N	143
782	5	00:10:00	00:15:00	\N	143
782	35	00:45:00	00:50:00	\N	143
782	20	01:20:00	01:25:00	\N	143
782	22	01:55:00	02:00:00	\N	143
782	41	02:30:00	02:35:00	\N	143
782	24	03:05:00	03:10:00	\N	143
782	14	03:40:00	00:00:00	\N	143
787	14	17:30:00	17:35:00	\N	118
787	15	18:05:00	18:10:00	\N	118
787	43	18:40:00	18:45:00	\N	118
787	2	19:15:00	19:20:00	\N	118
787	16	19:50:00	19:55:00	\N	118
787	45	20:25:00	20:30:00	\N	118
787	31	21:00:00	21:05:00	\N	118
787	4	21:35:00	21:40:00	\N	118
787	1	22:10:00	22:15:00	\N	118
787	27	22:45:00	22:50:00	\N	118
787	12	23:20:00	23:25:00	\N	118
787	18	23:55:00	00:00:00	\N	118
787	9	00:30:00	00:00:00	\N	118
788	9	16:00:00	16:05:00	\N	107
788	18	16:35:00	16:40:00	\N	107
788	12	17:10:00	17:15:00	\N	107
788	27	17:45:00	17:50:00	\N	107
788	1	18:20:00	18:25:00	\N	107
788	4	18:55:00	19:00:00	\N	107
788	31	19:30:00	19:35:00	\N	107
788	45	20:05:00	20:10:00	\N	107
788	16	20:40:00	20:45:00	\N	107
788	2	21:15:00	21:20:00	\N	107
788	43	21:50:00	21:55:00	\N	107
788	15	22:25:00	22:30:00	\N	107
788	14	23:00:00	00:00:00	\N	107
789	14	01:00:00	01:05:00	\N	127
789	24	01:35:00	01:40:00	\N	127
789	41	02:10:00	02:15:00	\N	127
789	22	02:45:00	02:50:00	\N	127
789	20	03:20:00	03:25:00	\N	127
789	30	03:55:00	04:00:00	\N	127
789	29	04:30:00	00:00:00	\N	127
790	29	17:00:00	17:05:00	\N	147
790	30	17:35:00	17:40:00	\N	147
790	20	18:10:00	18:15:00	\N	147
790	22	18:45:00	18:50:00	\N	147
790	41	19:20:00	19:25:00	\N	147
790	24	19:55:00	20:00:00	\N	147
790	14	20:30:00	00:00:00	\N	147
791	8	03:30:00	03:35:00	\N	105
791	20	04:05:00	04:10:00	\N	105
791	35	04:40:00	04:45:00	\N	105
791	5	05:15:00	05:20:00	\N	105
791	38	05:50:00	05:55:00	\N	105
791	17	06:25:00	06:30:00	\N	105
791	14	07:00:00	00:00:00	\N	105
792	14	23:00:00	23:05:00	\N	117
792	17	23:35:00	23:40:00	\N	117
792	38	00:10:00	00:15:00	\N	117
792	5	00:45:00	00:50:00	\N	117
792	35	01:20:00	01:25:00	\N	117
792	20	01:55:00	02:00:00	\N	117
792	8	02:30:00	00:00:00	\N	117
793	14	11:00:00	11:05:00	\N	129
793	24	11:35:00	11:40:00	\N	129
793	41	12:10:00	12:15:00	\N	129
793	22	12:45:00	12:50:00	\N	129
793	34	13:20:00	00:00:00	\N	129
794	34	17:30:00	17:35:00	\N	149
794	22	18:05:00	18:10:00	\N	149
794	41	18:40:00	18:45:00	\N	149
794	24	19:15:00	19:20:00	\N	149
794	14	19:50:00	00:00:00	\N	149
795	14	19:00:00	19:05:00	\N	116
795	23	19:35:00	19:40:00	\N	116
795	25	20:10:00	20:15:00	\N	116
795	3	20:45:00	00:00:00	\N	116
796	3	02:00:00	02:05:00	\N	103
796	25	02:35:00	02:40:00	\N	103
796	23	03:10:00	03:15:00	\N	103
796	14	03:45:00	00:00:00	\N	103
800	21	00:30:00	00:35:00	\N	141
800	30	01:05:00	01:10:00	\N	141
800	26	01:40:00	01:45:00	\N	141
800	41	02:15:00	02:20:00	\N	141
800	14	02:50:00	00:00:00	\N	141
703	9	09:30:00	09:35:00	\N	107
703	18	10:05:00	10:10:00	\N	107
703	12	10:40:00	10:45:00	\N	107
703	27	11:15:00	11:20:00	\N	107
703	1	11:50:00	11:55:00	\N	107
703	4	12:25:00	12:30:00	\N	107
703	31	13:00:00	13:05:00	\N	107
703	45	13:35:00	13:40:00	\N	107
703	16	14:10:00	14:15:00	\N	107
703	2	14:45:00	14:50:00	\N	107
703	43	15:20:00	15:25:00	\N	107
703	15	15:55:00	16:00:00	\N	107
703	14	16:30:00	00:00:00	\N	107
704	14	23:00:00	23:05:00	\N	118
704	15	23:35:00	23:40:00	\N	118
704	43	00:10:00	00:15:00	\N	118
704	2	00:45:00	00:50:00	\N	118
704	16	01:20:00	01:25:00	\N	118
704	45	01:55:00	02:00:00	\N	118
704	31	02:30:00	02:35:00	\N	118
704	4	03:05:00	03:10:00	\N	118
704	1	03:40:00	03:45:00	\N	118
704	27	04:15:00	04:20:00	\N	118
704	12	04:50:00	04:55:00	\N	118
704	18	05:25:00	05:30:00	\N	118
704	9	06:00:00	00:00:00	\N	118
717	14	01:30:00	01:35:00	\N	133
717	15	02:05:00	02:10:00	\N	133
717	43	02:40:00	02:45:00	\N	133
717	2	03:15:00	03:20:00	\N	133
717	16	03:50:00	03:55:00	\N	133
717	45	04:25:00	04:30:00	\N	133
717	31	05:00:00	05:05:00	\N	133
717	4	05:35:00	05:40:00	\N	133
717	1	06:10:00	06:15:00	\N	133
717	27	06:45:00	06:50:00	\N	133
717	12	07:20:00	07:25:00	\N	133
717	18	07:55:00	08:00:00	\N	133
717	40	08:30:00	00:00:00	\N	133
729	9	10:00:00	10:05:00	\N	106
729	6	10:35:00	10:40:00	\N	106
729	16	11:10:00	11:15:00	\N	106
729	2	11:45:00	11:50:00	\N	106
729	43	12:20:00	12:25:00	\N	106
729	14	12:55:00	13:00:00	\N	106
729	15	13:30:00	13:35:00	\N	106
729	45	14:05:00	14:10:00	\N	106
729	4	14:40:00	14:45:00	\N	106
729	1	15:15:00	15:20:00	\N	106
729	27	15:50:00	15:55:00	\N	106
729	12	16:25:00	16:30:00	\N	106
729	18	17:00:00	17:05:00	\N	106
729	7	17:35:00	00:00:00	\N	106
735	14	01:30:00	01:35:00	\N	134
735	24	02:05:00	02:10:00	\N	134
735	41	02:40:00	02:45:00	\N	134
735	22	03:15:00	03:20:00	\N	134
735	20	03:50:00	03:55:00	\N	134
735	35	04:25:00	04:30:00	\N	134
735	5	05:00:00	05:05:00	\N	134
735	38	05:35:00	05:40:00	\N	134
735	42	06:10:00	00:00:00	\N	134
736	42	03:30:00	03:35:00	\N	158
736	38	04:05:00	04:10:00	\N	158
736	5	04:40:00	04:45:00	\N	158
736	35	05:15:00	05:20:00	\N	158
736	20	05:50:00	05:55:00	\N	158
736	22	06:25:00	06:30:00	\N	158
736	41	07:00:00	07:05:00	\N	158
736	24	07:35:00	07:40:00	\N	158
736	14	08:10:00	00:00:00	\N	158
738	26	12:00:00	12:05:00	\N	143
738	38	12:35:00	12:40:00	\N	143
738	5	13:10:00	13:15:00	\N	143
738	35	13:45:00	13:50:00	\N	143
738	20	14:20:00	14:25:00	\N	143
738	22	14:55:00	15:00:00	\N	143
738	41	15:30:00	15:35:00	\N	143
738	24	16:05:00	16:10:00	\N	143
738	14	16:40:00	00:00:00	\N	143
740	40	15:00:00	15:05:00	\N	157
740	27	15:35:00	15:40:00	\N	157
740	1	16:10:00	16:15:00	\N	157
740	4	16:45:00	16:50:00	\N	157
740	45	17:20:00	17:25:00	\N	157
740	16	17:55:00	18:00:00	\N	157
740	15	18:30:00	18:35:00	\N	157
740	18	19:05:00	19:10:00	\N	157
740	12	19:40:00	19:45:00	\N	157
740	6	20:15:00	20:20:00	\N	157
740	31	20:50:00	20:55:00	\N	157
740	2	21:25:00	21:30:00	\N	157
740	43	22:00:00	22:05:00	\N	157
740	14	22:35:00	00:00:00	\N	157
741	9	02:30:00	02:35:00	\N	107
741	18	03:05:00	03:10:00	\N	107
741	12	03:40:00	03:45:00	\N	107
741	27	04:15:00	04:20:00	\N	107
741	1	04:50:00	04:55:00	\N	107
741	4	05:25:00	05:30:00	\N	107
741	31	06:00:00	06:05:00	\N	107
741	45	06:35:00	06:40:00	\N	107
741	16	07:10:00	07:15:00	\N	107
741	2	07:45:00	07:50:00	\N	107
741	43	08:20:00	08:25:00	\N	107
741	15	08:55:00	09:00:00	\N	107
741	14	09:30:00	00:00:00	\N	107
742	14	13:00:00	13:05:00	\N	118
742	15	13:35:00	13:40:00	\N	118
742	43	14:10:00	14:15:00	\N	118
742	2	14:45:00	14:50:00	\N	118
742	16	15:20:00	15:25:00	\N	118
742	45	15:55:00	16:00:00	\N	118
742	31	16:30:00	16:35:00	\N	118
742	4	17:05:00	17:10:00	\N	118
742	1	17:40:00	17:45:00	\N	118
742	27	18:15:00	18:20:00	\N	118
742	12	18:50:00	18:55:00	\N	118
742	18	19:25:00	19:30:00	\N	118
742	9	20:00:00	00:00:00	\N	118
743	14	06:30:00	06:35:00	\N	119
743	15	07:05:00	07:10:00	\N	119
743	24	07:40:00	07:45:00	\N	119
743	19	08:15:00	08:20:00	\N	119
743	30	08:50:00	08:55:00	\N	119
743	21	09:25:00	09:30:00	\N	119
743	13	10:00:00	00:00:00	\N	119
744	13	21:00:00	21:05:00	\N	115
744	21	21:35:00	21:40:00	\N	115
744	30	22:10:00	22:15:00	\N	115
744	19	22:45:00	22:50:00	\N	115
744	24	23:20:00	23:25:00	\N	115
744	15	23:55:00	00:00:00	\N	115
744	14	00:30:00	00:00:00	\N	115
745	14	04:00:00	04:05:00	\N	134
745	24	04:35:00	04:40:00	\N	134
745	41	05:10:00	05:15:00	\N	134
745	22	05:45:00	05:50:00	\N	134
745	20	06:20:00	06:25:00	\N	134
745	35	06:55:00	07:00:00	\N	134
745	5	07:30:00	07:35:00	\N	134
745	38	08:05:00	08:10:00	\N	134
745	42	08:40:00	00:00:00	\N	134
746	42	15:30:00	15:35:00	\N	158
746	38	16:05:00	16:10:00	\N	158
746	5	16:40:00	16:45:00	\N	158
746	35	17:15:00	17:20:00	\N	158
746	20	17:50:00	17:55:00	\N	158
746	22	18:25:00	18:30:00	\N	158
746	41	19:00:00	19:05:00	\N	158
746	24	19:35:00	19:40:00	\N	158
746	14	20:10:00	00:00:00	\N	158
747	25	05:30:00	05:35:00	\N	142
747	23	06:05:00	06:10:00	\N	142
747	11	06:40:00	06:45:00	\N	142
747	35	07:15:00	07:20:00	\N	142
747	5	07:50:00	07:55:00	\N	142
747	38	08:25:00	08:30:00	\N	142
747	17	09:00:00	09:05:00	\N	142
747	10	09:35:00	00:00:00	\N	142
748	10	05:00:00	05:05:00	\N	110
748	17	05:35:00	05:40:00	\N	110
748	38	06:10:00	06:15:00	\N	110
748	5	06:45:00	06:50:00	\N	110
748	35	07:20:00	07:25:00	\N	110
748	11	07:55:00	08:00:00	\N	110
748	23	08:30:00	08:35:00	\N	110
748	25	09:05:00	00:00:00	\N	110
749	14	12:00:00	12:05:00	\N	123
749	24	12:35:00	12:40:00	\N	123
749	41	13:10:00	13:15:00	\N	123
749	22	13:45:00	13:50:00	\N	123
749	20	14:20:00	14:25:00	\N	123
749	35	14:55:00	15:00:00	\N	123
749	5	15:30:00	15:35:00	\N	123
749	38	16:05:00	16:10:00	\N	123
749	26	16:40:00	00:00:00	\N	123
757	14	06:00:00	06:05:00	\N	120
757	24	06:35:00	06:40:00	\N	120
757	41	07:10:00	07:15:00	\N	120
757	22	07:45:00	07:50:00	\N	120
757	20	08:20:00	08:25:00	\N	120
757	35	08:55:00	09:00:00	\N	120
757	5	09:30:00	09:35:00	\N	120
757	38	10:05:00	10:10:00	\N	120
757	17	10:40:00	00:00:00	\N	120
758	17	05:00:00	05:05:00	\N	136
758	38	05:35:00	05:40:00	\N	136
758	5	06:10:00	06:15:00	\N	136
758	35	06:45:00	06:50:00	\N	136
758	20	07:20:00	07:25:00	\N	136
758	22	07:55:00	08:00:00	\N	136
758	41	08:30:00	08:35:00	\N	136
758	24	09:05:00	09:10:00	\N	136
758	14	09:40:00	00:00:00	\N	136
767	38	16:30:00	16:35:00	\N	154
767	5	17:05:00	17:10:00	\N	154
767	17	17:40:00	00:00:00	\N	154
768	17	10:30:00	10:35:00	\N	137
768	5	11:05:00	11:10:00	\N	137
768	38	11:40:00	00:00:00	\N	137
779	14	15:30:00	15:35:00	\N	125
779	15	16:05:00	16:10:00	\N	125
779	43	16:40:00	16:45:00	\N	125
779	2	17:15:00	17:20:00	\N	125
779	16	17:50:00	17:55:00	\N	125
779	45	18:25:00	18:30:00	\N	125
779	31	19:00:00	19:05:00	\N	125
779	4	19:35:00	19:40:00	\N	125
779	1	20:10:00	20:15:00	\N	125
779	27	20:45:00	00:00:00	\N	125
780	27	05:00:00	05:05:00	\N	145
780	1	05:35:00	05:40:00	\N	145
780	4	06:10:00	06:15:00	\N	145
780	31	06:45:00	06:50:00	\N	145
780	45	07:20:00	07:25:00	\N	145
780	16	07:55:00	08:00:00	\N	145
780	2	08:30:00	08:35:00	\N	145
780	43	09:05:00	09:10:00	\N	145
780	15	09:40:00	09:45:00	\N	145
780	14	10:15:00	00:00:00	\N	145
783	14	17:00:00	17:05:00	\N	135
783	24	17:35:00	17:40:00	\N	135
783	41	18:10:00	18:15:00	\N	135
783	22	18:45:00	18:50:00	\N	135
783	20	19:20:00	19:25:00	\N	135
783	35	19:55:00	20:00:00	\N	135
783	5	20:30:00	20:35:00	\N	135
783	38	21:05:00	21:10:00	\N	135
783	46	21:40:00	00:00:00	\N	135
784	46	04:00:00	04:05:00	\N	159
784	38	04:35:00	04:40:00	\N	159
784	5	05:10:00	05:15:00	\N	159
784	35	05:45:00	05:50:00	\N	159
784	20	06:20:00	06:25:00	\N	159
784	22	06:55:00	07:00:00	\N	159
784	41	07:30:00	07:35:00	\N	159
784	24	08:05:00	08:10:00	\N	159
784	14	08:40:00	00:00:00	\N	159
785	14	19:30:00	19:35:00	\N	118
785	15	20:05:00	20:10:00	\N	118
785	43	20:40:00	20:45:00	\N	118
785	2	21:15:00	21:20:00	\N	118
785	16	21:50:00	21:55:00	\N	118
785	45	22:25:00	22:30:00	\N	118
785	31	23:00:00	23:05:00	\N	118
785	4	23:35:00	23:40:00	\N	118
785	1	00:10:00	00:15:00	\N	118
785	27	00:45:00	00:50:00	\N	118
785	12	01:20:00	01:25:00	\N	118
785	18	01:55:00	02:00:00	\N	118
785	9	02:30:00	00:00:00	\N	118
786	9	03:30:00	03:35:00	\N	107
786	18	04:05:00	04:10:00	\N	107
786	12	04:40:00	04:45:00	\N	107
786	27	05:15:00	05:20:00	\N	107
786	1	05:50:00	05:55:00	\N	107
786	4	06:25:00	06:30:00	\N	107
786	31	07:00:00	07:05:00	\N	107
786	45	07:35:00	07:40:00	\N	107
786	16	08:10:00	08:15:00	\N	107
786	2	08:45:00	08:50:00	\N	107
786	43	09:20:00	09:25:00	\N	107
786	15	09:55:00	10:00:00	\N	107
786	14	10:30:00	00:00:00	\N	107
\.


--
-- TOC entry 5021 (class 0 OID 17042)
-- Dependencies: 221
-- Data for Name: train; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.train (train_code, name, off_day, route_id, admin_id) FROM stdin;
701	Subarna Express	Friday	107	\N
702	Subarna Express	Friday	118	\N
705	Ekota Express	Tuesday	120	\N
706	Ekota Express	Monday	136	\N
707	Tista Express	Monday	119	\N
708	Tista Express	Monday	115	\N
709	Parabat Express	Tuesday	133	\N
710	Parabat Express	Tuesday	157	\N
711	Upokul Express	Wednesday	148	\N
712	Upokul Express	Tuesday	128	\N
718	Joyantika Express	Thursday	157	\N
719	Paharika Express	Monday	108	\N
721	Mohanagar Provati	Sunday	107	\N
722	Mohanagar Godhuli	Sunday	118	\N
723	Udayan Express	Sunday	108	\N
726	Sundarban Express	Wednesday	113	\N
727	Rupsha Express	Thursday	114	\N
728	Rupsha Express	Thursday	113	\N
731	Barendra Express	Sunday	150	\N
732	Barendra Express	Sunday	111	\N
733	Titumir Express	Wednesday	150	\N
734	Titumir Express	Wednesday	111	\N
737	Egarosindhur Provati	Wednesday	123	\N
739	Upaban Express	Wednesday	133	\N
750	Egarosindhur Godhuli	Wednesday	143	\N
751	Lalmoni Express	Friday	126	\N
752	Lalmoni Express	Friday	146	\N
753	Silkcity Express	Sunday	130	\N
754	Silkcity Express	Sunday	151	\N
755	Madhumati Express	Thursday	140	\N
756	Madhumati Express	Thursday	152	\N
759	Padma Express	Tuesday	130	\N
760	Padma Express	Tuesday	151	\N
761	Sagardari Express	Monday	140	\N
762	Sagardari Express	Monday	152	\N
763	Chitra Express	Monday	139	\N
764	Chitra Express	Monday	121	\N
765	Nilsagar Express	Monday	138	\N
766	Nilsagar Express	Sunday	109	\N
769	Dhumketu Express	Sunday	130	\N
770	Dhumketu Express	Friday	151	\N
771	Rangpur Express	Sunday	131	\N
772	Rangpur Express	Sunday	153	\N
773	Kalni Express	Friday	133	\N
774	Kalni Express	Friday	157	\N
775	Sirajgonj Express	Saturday	132	\N
776	Sirajgonj Express	Saturday	155	\N
777	Haor Express	Wednesday	127	\N
778	Haor Express	Wednesday	147	\N
781	Kishoreganj Express	Friday	123	\N
782	Kishoreganj Express	Friday	143	\N
787	Shonar Bangla Express	Wednesday	118	\N
788	Shonar Bangla Express	Wednesday	107	\N
789	Mohangonj Express	Monday	127	\N
790	Mohangonj Express	Monday	147	\N
791	Banalata Express	Friday	105	\N
792	Banalata Express	Friday	117	\N
793	Panchagarh Express	None	129	\N
794	Panchagarh Express	None	149	\N
795	Benapole Express	None	116	\N
796	Benapole Express	None	103	\N
800	Jamalpur Express	None	141	\N
703	Mohanagar Godhuli	NONE	107	\N
704	Mohanagar Provati	NONE	118	\N
717	Joyantika Express	NONE	133	\N
729	Meghna Express	NONE	106	\N
735	Agnibina Express	NONE	134	\N
736	Agnibina Express	NONE	158	\N
738	Egarosindhur Provati	NONE	143	\N
740	Upaban Express	NONE	157	\N
741	Turna Express	NONE	107	\N
742	Turna Express	NONE	118	\N
743	Brahmaputra Express	NONE	119	\N
744	Brahmaputra Express	NONE	115	\N
745	Jamuna Express	NONE	134	\N
746	Jamuna Express	NONE	158	\N
747	Simanta Express	NONE	142	\N
748	Simanta Express	NONE	110	\N
749	Egarosindhur Godhuli	NONE	123	\N
757	Drutojan Express	NONE	120	\N
758	Drutojan Express	NONE	136	\N
767	Dolonchapa Express	NONE	154	\N
768	Dolonchapa Express	NONE	137	\N
779	Dhalarchar Express	NONE	125	\N
780	Dhalarchar Express	NONE	145	\N
783	Tungipara Express	NONE	135	\N
784	Tungipara Express	NONE	159	\N
785	Bijoy Express	NONE	118	\N
786	Bijoy Express	NONE	107	\N
\.


--
-- TOC entry 5022 (class 0 OID 17059)
-- Dependencies: 222
-- Data for Name: train_class; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.train_class (class_code, train_code) FROM stdin;
3	701
2	701
7	701
1	701
9	701
8	701
10	701
6	701
5	702
3	702
2	702
4	702
8	702
9	702
6	702
1	702
10	702
1	705
8	705
3	705
5	705
7	705
4	705
10	705
9	705
6	705
3	706
7	706
8	706
10	706
6	706
4	706
9	706
5	706
1	706
2	706
2	707
8	707
9	707
10	707
6	707
1	707
7	707
3	707
8	708
5	708
2	708
7	708
3	708
10	708
4	708
6	708
1	708
1	709
3	709
10	709
2	709
9	709
7	709
5	709
6	709
4	709
8	709
2	710
8	710
7	710
3	710
9	710
5	710
4	710
10	711
7	711
3	711
9	711
8	711
1	711
6	711
4	711
5	711
2	711
9	712
5	712
1	712
2	712
8	712
6	712
3	712
4	712
10	712
1	718
7	718
8	718
6	718
5	718
9	718
4	718
7	719
1	719
8	719
9	719
2	719
4	719
5	719
5	721
7	721
4	721
8	721
6	721
9	721
1	721
8	722
2	722
3	722
7	722
5	722
6	722
10	722
4	723
6	723
5	723
1	723
2	723
3	723
9	723
7	723
3	726
9	726
7	726
8	726
10	726
1	726
5	726
2	726
6	727
2	727
1	727
4	727
5	727
8	727
10	727
7	727
9	727
2	728
6	728
4	728
3	728
10	728
7	728
8	728
1	728
5	728
9	728
4	731
6	731
9	731
8	731
5	731
3	731
7	731
2	731
2	732
7	732
3	732
1	732
4	732
10	732
5	732
9	732
8	732
6	732
9	733
1	733
10	733
7	733
8	733
5	733
4	733
3	733
6	733
8	734
4	734
1	734
5	734
2	734
9	734
7	734
10	734
3	734
6	734
1	737
5	737
2	737
7	737
6	737
8	737
10	737
10	739
1	739
4	739
5	739
3	739
6	739
7	739
7	750
10	750
9	750
8	750
5	750
2	750
4	750
2	751
1	751
9	751
3	751
5	751
4	751
10	751
6	751
5	752
3	752
4	752
2	752
1	752
9	752
10	752
7	752
1	753
5	753
6	753
9	753
8	753
2	753
4	753
7	753
8	754
4	754
5	754
10	754
2	754
1	754
9	754
10	755
9	755
7	755
3	755
8	755
2	755
6	755
2	756
8	756
3	756
4	756
10	756
7	756
9	756
5	756
5	759
7	759
9	759
1	759
8	759
10	759
6	759
6	760
10	760
2	760
8	760
1	760
5	760
3	760
8	761
1	761
6	761
3	761
4	761
9	761
10	761
7	761
2	761
5	761
1	762
5	762
9	762
4	762
8	762
10	762
3	762
2	762
4	763
9	763
5	763
3	763
6	763
7	763
2	763
1	763
8	764
7	764
9	764
4	764
6	764
5	764
10	764
1	764
4	765
7	765
6	765
10	765
2	765
5	765
1	765
9	765
8	766
7	766
1	766
4	766
10	766
6	766
5	766
2	766
3	766
9	769
8	769
7	769
5	769
1	769
2	769
6	769
10	770
4	770
8	770
5	770
7	770
9	770
2	770
1	770
6	770
3	770
8	771
9	771
3	771
4	771
2	771
10	771
6	771
5	771
7	771
1	771
2	772
4	772
6	772
9	772
10	772
1	772
8	772
4	773
9	773
1	773
10	773
8	773
7	773
5	773
5	774
2	774
4	774
9	774
8	774
3	774
7	774
1	774
6	774
10	774
6	775
3	775
8	775
10	775
4	775
5	775
2	775
1	776
9	776
2	776
3	776
10	776
4	776
7	776
6	776
5	776
2	777
6	777
8	777
7	777
1	777
5	777
10	777
3	777
4	777
9	777
9	778
6	778
2	778
10	778
8	778
3	778
5	778
1	778
3	781
5	781
9	781
1	781
4	781
7	781
10	781
10	782
5	782
1	782
3	782
7	782
8	782
6	782
2	782
4	782
9	782
2	787
4	787
8	787
1	787
3	787
10	787
7	787
9	787
5	787
6	787
1	788
8	788
2	788
6	788
9	788
3	788
4	788
5	788
7	788
10	788
10	789
4	789
9	789
6	789
5	789
8	789
3	789
3	790
8	790
7	790
2	790
4	790
5	790
9	790
3	791
8	791
9	791
2	791
1	791
6	791
10	791
4	791
1	792
2	792
7	792
4	792
5	792
10	792
3	792
8	793
2	793
10	793
5	793
9	793
1	793
7	793
8	794
5	794
6	794
7	794
4	794
3	794
9	794
2	794
9	795
5	795
2	795
3	795
7	795
10	795
8	795
1	795
6	795
4	795
4	796
3	796
1	796
7	796
8	796
10	796
2	796
9	796
6	796
5	796
3	800
8	800
7	800
2	800
6	800
10	800
9	800
3	703
7	703
9	703
6	703
1	703
8	703
2	703
10	703
4	703
5	703
6	704
10	704
2	704
8	704
9	704
1	704
4	704
6	717
1	717
8	717
5	717
2	717
3	717
10	717
9	717
4	717
7	717
10	729
8	729
3	729
4	729
6	729
9	729
7	729
2	729
5	729
1	729
10	735
4	735
2	735
1	735
5	735
9	735
3	735
6	735
1	736
6	736
4	736
10	736
8	736
7	736
9	736
2	736
5	736
3	736
2	738
9	738
3	738
4	738
6	738
8	738
10	738
3	740
4	740
8	740
6	740
7	740
5	740
10	740
2	740
1	740
7	741
8	741
10	741
5	741
3	741
2	741
6	741
4	741
4	742
10	742
9	742
2	742
8	742
6	742
5	742
3	743
4	743
2	743
10	743
5	743
8	743
6	743
1	743
4	744
3	744
1	744
5	744
10	744
7	744
2	744
8	745
9	745
3	745
2	745
7	745
10	745
5	745
6	746
9	746
3	746
7	746
4	746
1	746
8	746
5	746
6	747
10	747
4	747
3	747
7	747
9	747
5	747
8	747
1	747
2	747
9	748
6	748
10	748
3	748
1	748
8	748
4	748
5	748
8	749
6	749
2	749
7	749
1	749
3	749
4	749
10	749
5	749
5	757
2	757
10	757
1	757
3	757
9	757
7	757
4	758
5	758
6	758
8	758
3	758
2	758
10	758
1	758
9	758
9	767
3	767
8	767
7	767
5	767
6	767
1	767
2	767
10	767
4	767
2	768
4	768
5	768
10	768
1	768
7	768
3	768
9	768
6	768
6	779
8	779
2	779
3	779
7	779
10	779
9	779
1	779
5	779
3	780
1	780
2	780
9	780
6	780
5	780
8	780
2	783
1	783
10	783
6	783
4	783
8	783
9	783
5	783
8	784
1	784
2	784
7	784
10	784
6	784
4	784
1	785
6	785
10	785
4	785
5	785
3	785
2	785
6	786
8	786
9	786
10	786
7	786
1	786
5	786
2	786
4	786
\.


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 234
-- Name: ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ticket_id_seq', 66, true);


--
-- TOC entry 4818 (class 2606 OID 17020)
-- Name: admin admin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin
    ADD CONSTRAINT admin_pkey PRIMARY KEY (admin_id);


--
-- TOC entry 4828 (class 2606 OID 17065)
-- Name: train_class class_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_class
    ADD CONSTRAINT class_pkey PRIMARY KEY (class_code, train_code);


--
-- TOC entry 4850 (class 2606 OID 17197)
-- Name: class class_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class
    ADD CONSTRAINT class_pkey1 PRIMARY KEY (class_code);


--
-- TOC entry 4852 (class 2606 OID 17218)
-- Name: distance_storage fare_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.distance_storage
    ADD CONSTRAINT fare_pkey PRIMARY KEY (from_station, to_station);


--
-- TOC entry 4830 (class 2606 OID 17075)
-- Name: layout layout_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout
    ADD CONSTRAINT layout_pkey PRIMARY KEY (layout_id);


--
-- TOC entry 4820 (class 2606 OID 17027)
-- Name: passenger passenger_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.passenger
    ADD CONSTRAINT passenger_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4836 (class 2606 OID 17107)
-- Name: payment_history payment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_history
    ADD CONSTRAINT payment_history_pkey PRIMARY KEY (payment_id);


--
-- TOC entry 4838 (class 2606 OID 17121)
-- Name: refund_history refund_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refund_history
    ADD CONSTRAINT refund_history_pkey PRIMARY KEY (refund_id);


--
-- TOC entry 4824 (class 2606 OID 17041)
-- Name: route route_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route
    ADD CONSTRAINT route_pkey PRIMARY KEY (route_id);


--
-- TOC entry 4846 (class 2606 OID 17162)
-- Name: route_station route_station_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_station
    ADD CONSTRAINT route_station_pkey PRIMARY KEY (station_id, route_id);


--
-- TOC entry 4844 (class 2606 OID 17152)
-- Name: seat_coordinate seat_coordinate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_coordinate
    ADD CONSTRAINT seat_coordinate_pkey PRIMARY KEY (layout_id, seat_name);


--
-- TOC entry 4832 (class 2606 OID 17221)
-- Name: seat seat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat
    ADD CONSTRAINT seat_pkey PRIMARY KEY (class_code, train_code);


--
-- TOC entry 4840 (class 2606 OID 17135)
-- Name: seat_reservation seat_reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservation
    ADD CONSTRAINT seat_reservation_pkey PRIMARY KEY (ticket_id, seat_number, class_code, train_code);


--
-- TOC entry 4822 (class 2606 OID 17034)
-- Name: station station_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.station
    ADD CONSTRAINT station_pkey PRIMARY KEY (station_id);


--
-- TOC entry 4834 (class 2606 OID 17095)
-- Name: ticket ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_pkey PRIMARY KEY (ticket_id);


--
-- TOC entry 4848 (class 2606 OID 17177)
-- Name: time_table time_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_table
    ADD CONSTRAINT time_table_pkey PRIMARY KEY (train_code, station_id);


--
-- TOC entry 4826 (class 2606 OID 17048)
-- Name: train train_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_pkey PRIMARY KEY (train_code);


--
-- TOC entry 4842 (class 2606 OID 17265)
-- Name: seat_reservation unique_exact_seat_reservation; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservation
    ADD CONSTRAINT unique_exact_seat_reservation UNIQUE (seat_number, class_code, train_code, from_station, to_station, date);


--
-- TOC entry 4869 (class 2620 OID 17230)
-- Name: ticket trg_delete_seat_reservations; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_delete_seat_reservations BEFORE DELETE ON public.ticket FOR EACH ROW EXECUTE FUNCTION public.delete_seat_reservations_for_ticket();


--
-- TOC entry 4868 (class 2620 OID 17228)
-- Name: passenger trg_delete_tickets; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_delete_tickets BEFORE DELETE ON public.passenger FOR EACH ROW EXECUTE FUNCTION public.delete_tickets_for_passenger();


--
-- TOC entry 4870 (class 2620 OID 17259)
-- Name: ticket trg_handle_ticket_delete; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_handle_ticket_delete AFTER DELETE ON public.ticket FOR EACH ROW EXECUTE FUNCTION public.handle_ticket_delete();


--
-- TOC entry 4871 (class 2620 OID 17232)
-- Name: ticket trg_insert_payment_history; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_insert_payment_history AFTER INSERT ON public.ticket FOR EACH ROW EXECUTE FUNCTION public.insert_payment_history_on_ticket();


--
-- TOC entry 4855 (class 2606 OID 17066)
-- Name: train_class class_train_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_class
    ADD CONSTRAINT class_train_code_fkey FOREIGN KEY (train_code) REFERENCES public.train(train_code);


--
-- TOC entry 4856 (class 2606 OID 17198)
-- Name: train_class fk_class_train_class; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train_class
    ADD CONSTRAINT fk_class_train_class FOREIGN KEY (class_code) REFERENCES public.class(class_code);


--
-- TOC entry 4857 (class 2606 OID 17076)
-- Name: layout layout_class_code_train_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.layout
    ADD CONSTRAINT layout_class_code_train_code_fkey FOREIGN KEY (class_code, train_code) REFERENCES public.train_class(class_code, train_code);


--
-- TOC entry 4863 (class 2606 OID 17168)
-- Name: route_station route_station_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_station
    ADD CONSTRAINT route_station_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.route(route_id);


--
-- TOC entry 4864 (class 2606 OID 17163)
-- Name: route_station route_station_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_station
    ADD CONSTRAINT route_station_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.station(station_id);


--
-- TOC entry 4858 (class 2606 OID 17086)
-- Name: seat seat_class_code_train_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat
    ADD CONSTRAINT seat_class_code_train_code_fkey FOREIGN KEY (class_code, train_code) REFERENCES public.train_class(class_code, train_code);


--
-- TOC entry 4862 (class 2606 OID 17153)
-- Name: seat_coordinate seat_coordinate_layout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_coordinate
    ADD CONSTRAINT seat_coordinate_layout_id_fkey FOREIGN KEY (layout_id) REFERENCES public.layout(layout_id);


--
-- TOC entry 4860 (class 2606 OID 17222)
-- Name: seat_reservation seat_reservation_class_train_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservation
    ADD CONSTRAINT seat_reservation_class_train_fkey FOREIGN KEY (class_code, train_code) REFERENCES public.seat(class_code, train_code);


--
-- TOC entry 4861 (class 2606 OID 17136)
-- Name: seat_reservation seat_reservation_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seat_reservation
    ADD CONSTRAINT seat_reservation_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.ticket(ticket_id);


--
-- TOC entry 4859 (class 2606 OID 17096)
-- Name: ticket ticket_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.passenger(user_id);


--
-- TOC entry 4865 (class 2606 OID 17188)
-- Name: time_table time_table_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_table
    ADD CONSTRAINT time_table_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin(admin_id);


--
-- TOC entry 4866 (class 2606 OID 17183)
-- Name: time_table time_table_station_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_table
    ADD CONSTRAINT time_table_station_id_fkey FOREIGN KEY (station_id) REFERENCES public.station(station_id);


--
-- TOC entry 4867 (class 2606 OID 17178)
-- Name: time_table time_table_train_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_table
    ADD CONSTRAINT time_table_train_code_fkey FOREIGN KEY (train_code) REFERENCES public.train(train_code);


--
-- TOC entry 4853 (class 2606 OID 17054)
-- Name: train train_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin(admin_id);


--
-- TOC entry 4854 (class 2606 OID 17049)
-- Name: train train_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.train
    ADD CONSTRAINT train_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.route(route_id);


-- Completed on 2025-07-16 17:10:36

--
-- PostgreSQL database dump complete
--

