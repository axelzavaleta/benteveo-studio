--
-- PostgreSQL database dump
--

\restrict 2f9c3srAg47N0TDVyjpbyMp5CwTPqONeHTGnWGJFCoEtRQcuE98wvNYTLNcOVfA

-- Dumped from database version 18.0 (Debian 18.0-1.pgdg12+3)
-- Dumped by pg_dump version 18.0 (Debian 18.0-1.pgdg12+3)

-- Started on 2025-10-07 18:08:34 -03

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
-- TOC entry 2 (class 3079 OID 18726)
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- TOC entry 4 (class 3079 OID 17722)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 3 (class 3079 OID 18719)
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- TOC entry 5 (class 3079 OID 17711)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 311 (class 1255 OID 18683)
-- Name: calculate_invoice_totals(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_invoice_totals() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_total_net DECIMAL(12,2);
    v_total_vat DECIMAL(12,2);
BEGIN
    -- Calculate totals from invoice items
    SELECT 
        COALESCE(SUM(subtotal), 0),
        COALESCE(SUM(vat_amount), 0)
    INTO v_total_net, v_total_vat
    FROM invoice_items
    WHERE invoice_id = NEW.invoice_id;
    
    -- Update invoice totals
    UPDATE invoices
    SET 
        total_net = v_total_net,
        total_vat = v_total_vat,
        total = v_total_net + v_total_vat
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.calculate_invoice_totals() OWNER TO postgres;

--
-- TOC entry 330 (class 1255 OID 16653)
-- Name: fn_list_tables(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.fn_list_tables() RETURNS TABLE(tabla_name text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';
END;
$$;


ALTER FUNCTION public.fn_list_tables() OWNER TO postgres;

--
-- TOC entry 331 (class 1255 OID 18670)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- TOC entry 295 (class 1255 OID 18685)
-- Name: validate_invoice_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_invoice_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_last_number INT;
BEGIN
    -- Get the last invoice number for this type and point of sale
    SELECT MAX(number) INTO v_last_number
    FROM invoices
    WHERE type = NEW.type 
    AND point_of_sale = NEW.point_of_sale
    AND id != COALESCE(NEW.id, 0);
    
    -- Check if the new number is sequential
    IF v_last_number IS NOT NULL AND NEW.number != v_last_number + 1 THEN
        RAISE EXCEPTION 'Invoice number must be sequential. Expected: %, Got: %', v_last_number + 1, NEW.number;
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.validate_invoice_number() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 262 (class 1259 OID 23208)
-- Name: calificaciones_productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calificaciones_productos (
    calificacion_producto_id integer NOT NULL,
    calificacion_producto_valor double precision NOT NULL,
    calificacion_producto_producto_id integer CONSTRAINT calificaciones_productos_calificacion_producto_product_not_null NOT NULL,
    calificacion_producto_usuario_id integer CONSTRAINT calificaciones_productos_calificacion_producto_usuario_not_null NOT NULL,
    calificacion_producto_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT calificaciones_productos_calificacion_producto_valor_check CHECK (((calificacion_producto_valor >= (1)::double precision) AND (calificacion_producto_valor <= (5)::double precision)))
);


ALTER TABLE public.calificaciones_productos OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 23207)
-- Name: calificaciones_productos_calificacion_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calificaciones_productos_calificacion_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calificaciones_productos_calificacion_producto_id_seq OWNER TO postgres;

--
-- TOC entry 4001 (class 0 OID 0)
-- Dependencies: 261
-- Name: calificaciones_productos_calificacion_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calificaciones_productos_calificacion_producto_id_seq OWNED BY public.calificaciones_productos.calificacion_producto_id;


--
-- TOC entry 264 (class 1259 OID 23233)
-- Name: calificaciones_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.calificaciones_reviews (
    calificacion_review_id integer NOT NULL,
    calificacion_review_valor double precision NOT NULL,
    calificacion_review_review_id integer NOT NULL,
    calificacion_review_usuario_id integer NOT NULL,
    calificacion_review_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT calificaciones_reviews_calificacion_review_valor_check CHECK (((calificacion_review_valor >= (1)::double precision) AND (calificacion_review_valor <= (5)::double precision)))
);


ALTER TABLE public.calificaciones_reviews OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 23232)
-- Name: calificaciones_reviews_calificacion_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.calificaciones_reviews_calificacion_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calificaciones_reviews_calificacion_review_id_seq OWNER TO postgres;

--
-- TOC entry 4002 (class 0 OID 0)
-- Dependencies: 263
-- Name: calificaciones_reviews_calificacion_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.calificaciones_reviews_calificacion_review_id_seq OWNED BY public.calificaciones_reviews.calificacion_review_id;


--
-- TOC entry 240 (class 1259 OID 22854)
-- Name: cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cliente (
    cliente_id integer NOT NULL,
    cliente_nombre text NOT NULL,
    cliente_email text NOT NULL,
    cliente_telefono text,
    cliente_cuit text,
    cliente_dni text,
    cliente_condicion_iva_id integer,
    cliente_ubicacion_id integer,
    cliente_activo boolean DEFAULT true,
    cliente_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    cliente_actualizado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cliente OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 22853)
-- Name: cliente_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cliente_cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cliente_cliente_id_seq OWNER TO postgres;

--
-- TOC entry 4003 (class 0 OID 0)
-- Dependencies: 239
-- Name: cliente_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cliente_cliente_id_seq OWNED BY public.cliente.cliente_id;


--
-- TOC entry 230 (class 1259 OID 22616)
-- Name: condicion_iva; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.condicion_iva (
    condicion_iva_id integer NOT NULL,
    condicion_iva_nombre character varying(100) NOT NULL,
    condicion_iva_codigo character varying(10),
    condicion_iva_discrimina_iva boolean DEFAULT false,
    condicion_iva_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.condicion_iva OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 22615)
-- Name: condicion_iva_condicion_iva_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.condicion_iva_condicion_iva_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.condicion_iva_condicion_iva_id_seq OWNER TO postgres;

--
-- TOC entry 4004 (class 0 OID 0)
-- Dependencies: 229
-- Name: condicion_iva_condicion_iva_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.condicion_iva_condicion_iva_id_seq OWNED BY public.condicion_iva.condicion_iva_id;


--
-- TOC entry 254 (class 1259 OID 23102)
-- Name: detalle_factura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_factura (
    detalle_factura_id integer NOT NULL,
    detalle_factura_factura_id integer NOT NULL,
    detalle_factura_descripcion text NOT NULL,
    detalle_factura_cantidad integer NOT NULL,
    detalle_factura_precio_unitario numeric(12,2) NOT NULL,
    detalle_factura_subtotal numeric(12,2) GENERATED ALWAYS AS (((detalle_factura_cantidad)::numeric * detalle_factura_precio_unitario)) STORED,
    detalle_factura_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT detalle_factura_detalle_factura_cantidad_check CHECK ((detalle_factura_cantidad > 0)),
    CONSTRAINT detalle_factura_detalle_factura_precio_unitario_check CHECK ((detalle_factura_precio_unitario >= (0)::numeric))
);


ALTER TABLE public.detalle_factura OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 23101)
-- Name: detalle_factura_detalle_factura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_factura_detalle_factura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_factura_detalle_factura_id_seq OWNER TO postgres;

--
-- TOC entry 4005 (class 0 OID 0)
-- Dependencies: 253
-- Name: detalle_factura_detalle_factura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_factura_detalle_factura_id_seq OWNED BY public.detalle_factura.detalle_factura_id;


--
-- TOC entry 258 (class 1259 OID 23153)
-- Name: detalle_orden; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_orden (
    detalle_orden_id integer NOT NULL,
    detalle_orden_orden_id integer NOT NULL,
    detalle_orden_producto_id integer,
    detalle_orden_descripcion text,
    detalle_orden_cantidad integer NOT NULL,
    detalle_orden_precio_unitario numeric(12,2) NOT NULL,
    detalle_orden_subtotal numeric(12,2) GENERATED ALWAYS AS (((detalle_orden_cantidad)::numeric * detalle_orden_precio_unitario)) STORED,
    detalle_orden_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT detalle_orden_detalle_orden_cantidad_check CHECK ((detalle_orden_cantidad > 0)),
    CONSTRAINT detalle_orden_detalle_orden_precio_unitario_check CHECK ((detalle_orden_precio_unitario >= (0)::numeric))
);


ALTER TABLE public.detalle_orden OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 23152)
-- Name: detalle_orden_detalle_orden_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_orden_detalle_orden_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detalle_orden_detalle_orden_id_seq OWNER TO postgres;

--
-- TOC entry 4006 (class 0 OID 0)
-- Dependencies: 257
-- Name: detalle_orden_detalle_orden_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_orden_detalle_orden_id_seq OWNED BY public.detalle_orden.detalle_orden_id;


--
-- TOC entry 238 (class 1259 OID 22826)
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    empresa_id integer NOT NULL,
    empresa_razon_social text NOT NULL,
    empresa_cuit text NOT NULL,
    empresa_condicion_iva_id integer NOT NULL,
    empresa_ubicacion_id integer,
    empresa_telefono text,
    empresa_email text,
    empresa_web text,
    empresa_logo_url text,
    empresa_activo boolean DEFAULT true,
    empresa_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    empresa_actualizado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.empresa OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 22825)
-- Name: empresa_empresa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_empresa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.empresa_empresa_id_seq OWNER TO postgres;

--
-- TOC entry 4007 (class 0 OID 0)
-- Dependencies: 237
-- Name: empresa_empresa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_empresa_id_seq OWNED BY public.empresa.empresa_id;


--
-- TOC entry 232 (class 1259 OID 22629)
-- Name: estado_orden; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_orden (
    estado_orden_id integer NOT NULL,
    estado_orden_nombre character varying(50) NOT NULL,
    estado_orden_descripcion text,
    estado_orden_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.estado_orden OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 22628)
-- Name: estado_orden_estado_orden_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_orden_estado_orden_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_orden_estado_orden_id_seq OWNER TO postgres;

--
-- TOC entry 4008 (class 0 OID 0)
-- Dependencies: 231
-- Name: estado_orden_estado_orden_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_orden_estado_orden_id_seq OWNED BY public.estado_orden.estado_orden_id;


--
-- TOC entry 236 (class 1259 OID 22657)
-- Name: estado_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estado_usuario (
    estado_usuario_id integer NOT NULL,
    estado_usuario_nombre character varying(50) NOT NULL,
    estado_usuario_descripcion text,
    estado_usuario_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.estado_usuario OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 22656)
-- Name: estado_usuario_estado_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estado_usuario_estado_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estado_usuario_estado_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 4009 (class 0 OID 0)
-- Dependencies: 235
-- Name: estado_usuario_estado_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estado_usuario_estado_usuario_id_seq OWNED BY public.estado_usuario.estado_usuario_id;


--
-- TOC entry 226 (class 1259 OID 22588)
-- Name: etiquetas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.etiquetas (
    etiqueta_id integer NOT NULL,
    etiqueta_nombre text NOT NULL,
    etiqueta_descripcion text,
    etiqueta_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    etiqueta_actualizado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.etiquetas OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 22587)
-- Name: etiquetas_etiqueta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etiquetas_etiqueta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etiquetas_etiqueta_id_seq OWNER TO postgres;

--
-- TOC entry 4010 (class 0 OID 0)
-- Dependencies: 225
-- Name: etiquetas_etiqueta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etiquetas_etiqueta_id_seq OWNED BY public.etiquetas.etiqueta_id;


--
-- TOC entry 248 (class 1259 OID 23012)
-- Name: factura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factura (
    factura_id integer NOT NULL,
    factura_tipo character varying(1) NOT NULL,
    factura_numero text NOT NULL,
    factura_punto_venta integer NOT NULL,
    factura_fecha_emision timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    factura_fecha_vencimiento timestamp without time zone,
    factura_empresa_id integer NOT NULL,
    factura_cliente_id integer NOT NULL,
    factura_orden_id integer,
    factura_condicion_pago text NOT NULL,
    factura_moneda character(3) DEFAULT 'ARS'::bpchar,
    factura_cotizacion numeric(10,4) DEFAULT 1,
    factura_subtotal numeric(12,2) NOT NULL,
    factura_descuento numeric(12,2) DEFAULT 0,
    factura_neto_gravado numeric(12,2) NOT NULL,
    factura_iva_monto numeric(12,2) DEFAULT 0,
    factura_percepciones numeric(12,2) DEFAULT 0,
    factura_total numeric(12,2) NOT NULL,
    factura_cae character varying(14),
    factura_cae_vencimiento date,
    factura_afip_respuesta jsonb,
    factura_qr_data text,
    factura_pdf_url text,
    factura_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    factura_actualizado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.factura OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 23055)
-- Name: factura_a; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factura_a (
    factura_a_id integer NOT NULL,
    factura_a_factura_id integer NOT NULL,
    factura_a_cliente_dni text NOT NULL,
    factura_a_cliente_nombre text NOT NULL,
    factura_a_cliente_direccion text,
    factura_a_cliente_condicion_iva character varying(100) NOT NULL,
    factura_a_iva_discriminado numeric(12,2) NOT NULL,
    factura_a_percepciones numeric(12,2) DEFAULT 0,
    factura_a_observaciones text,
    factura_a_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.factura_a OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 23054)
-- Name: factura_a_factura_a_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factura_a_factura_a_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factura_a_factura_a_id_seq OWNER TO postgres;

--
-- TOC entry 4011 (class 0 OID 0)
-- Dependencies: 249
-- Name: factura_a_factura_a_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.factura_a_factura_a_id_seq OWNED BY public.factura_a.factura_a_id;


--
-- TOC entry 252 (class 1259 OID 23079)
-- Name: factura_b; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.factura_b (
    factura_b_id integer NOT NULL,
    factura_b_factura_id integer NOT NULL,
    factura_b_cliente_dni text NOT NULL,
    factura_b_cliente_nombre text NOT NULL,
    factura_b_cliente_direccion text,
    factura_b_cliente_condicion_iva character varying(100),
    factura_b_iva_incluido numeric(12,2) NOT NULL,
    factura_b_descuento numeric(12,2) DEFAULT 0,
    factura_b_observaciones text,
    factura_b_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.factura_b OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 23078)
-- Name: factura_b_factura_b_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factura_b_factura_b_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factura_b_factura_b_id_seq OWNER TO postgres;

--
-- TOC entry 4012 (class 0 OID 0)
-- Dependencies: 251
-- Name: factura_b_factura_b_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.factura_b_factura_b_id_seq OWNED BY public.factura_b.factura_b_id;


--
-- TOC entry 247 (class 1259 OID 23011)
-- Name: factura_factura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factura_factura_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.factura_factura_id_seq OWNER TO postgres;

--
-- TOC entry 4013 (class 0 OID 0)
-- Dependencies: 247
-- Name: factura_factura_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.factura_factura_id_seq OWNED BY public.factura.factura_id;


--
-- TOC entry 228 (class 1259 OID 22603)
-- Name: medio_de_pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medio_de_pago (
    medio_de_pago_id integer NOT NULL,
    medio_de_pago_nombre text NOT NULL
);


ALTER TABLE public.medio_de_pago OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 22602)
-- Name: medio_de_pago_medio_de_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medio_de_pago_medio_de_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medio_de_pago_medio_de_pago_id_seq OWNER TO postgres;

--
-- TOC entry 4014 (class 0 OID 0)
-- Dependencies: 227
-- Name: medio_de_pago_medio_de_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medio_de_pago_medio_de_pago_id_seq OWNED BY public.medio_de_pago.medio_de_pago_id;


--
-- TOC entry 246 (class 1259 OID 22981)
-- Name: orden; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orden (
    orden_id integer NOT NULL,
    orden_usuario_id integer,
    orden_cliente_id integer,
    orden_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    orden_estado_id integer NOT NULL,
    orden_subtotal numeric(12,2),
    orden_descuento numeric(12,2) DEFAULT 0,
    orden_total numeric(12,2),
    orden_descripcion text,
    orden_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    orden_actualizado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.orden OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 22980)
-- Name: orden_orden_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orden_orden_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orden_orden_id_seq OWNER TO postgres;

--
-- TOC entry 4015 (class 0 OID 0)
-- Dependencies: 245
-- Name: orden_orden_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orden_orden_id_seq OWNED BY public.orden.orden_id;


--
-- TOC entry 256 (class 1259 OID 23125)
-- Name: pago; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pago (
    pago_id integer NOT NULL,
    pago_factura_id integer NOT NULL,
    pago_medio_de_pago_id integer NOT NULL,
    pago_monto numeric(12,2) NOT NULL,
    pago_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    pago_descripcion text,
    pago_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pago_pago_monto_check CHECK ((pago_monto >= (0)::numeric))
);


ALTER TABLE public.pago OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 23124)
-- Name: pago_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pago_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pago_pago_id_seq OWNER TO postgres;

--
-- TOC entry 4016 (class 0 OID 0)
-- Dependencies: 255
-- Name: pago_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pago_pago_id_seq OWNED BY public.pago.pago_id;


--
-- TOC entry 244 (class 1259 OID 22915)
-- Name: producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.producto (
    producto_id integer NOT NULL,
    producto_nombre text NOT NULL,
    producto_descripcion text,
    producto_tipo character varying(50) DEFAULT 'digital'::character varying NOT NULL,
    producto_formato character varying(100),
    producto_tamano_mb numeric(10,2),
    producto_url_descarga text,
    producto_licencia character varying(1000),
    producto_fecha_creacion date DEFAULT CURRENT_DATE,
    producto_imagen_url text,
    producto_descuento double precision DEFAULT 0,
    producto_precio numeric(12,2) NOT NULL,
    producto_moneda character(3) DEFAULT 'ARS'::bpchar,
    producto_etiqueta_id integer NOT NULL,
    producto_activo boolean DEFAULT true,
    producto_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    producto_actualizado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT producto_producto_descuento_check CHECK (((producto_descuento >= (0)::double precision) AND (producto_descuento <= (100)::double precision))),
    CONSTRAINT producto_producto_precio_check CHECK ((producto_precio >= (0)::numeric))
);


ALTER TABLE public.producto OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 22914)
-- Name: producto_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.producto_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.producto_producto_id_seq OWNER TO postgres;

--
-- TOC entry 4017 (class 0 OID 0)
-- Dependencies: 243
-- Name: producto_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.producto_producto_id_seq OWNED BY public.producto.producto_id;


--
-- TOC entry 260 (class 1259 OID 23180)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    review_id integer NOT NULL,
    review_texto text NOT NULL,
    review_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    review_usuario_id integer NOT NULL,
    review_producto_id integer NOT NULL,
    review_activo boolean DEFAULT true,
    review_creado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    review_actualizado_fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 23179)
-- Name: reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_review_id_seq OWNER TO postgres;

--
-- TOC entry 4018 (class 0 OID 0)
-- Dependencies: 259
-- Name: reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reviews_review_id_seq OWNED BY public.reviews.review_id;


--
-- TOC entry 234 (class 1259 OID 22643)
-- Name: rol_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol_usuario (
    rol_usuario_id integer NOT NULL,
    rol_usuario_nombre character varying(50) NOT NULL,
    rol_usuario_descripcion text,
    rol_usuario_permisos jsonb,
    rol_usuario_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.rol_usuario OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 22642)
-- Name: rol_usuario_rol_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.rol_usuario_rol_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rol_usuario_rol_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 4019 (class 0 OID 0)
-- Dependencies: 233
-- Name: rol_usuario_rol_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.rol_usuario_rol_usuario_id_seq OWNED BY public.rol_usuario.rol_usuario_id;


--
-- TOC entry 224 (class 1259 OID 22573)
-- Name: ubicacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ubicacion (
    ubicacion_id integer NOT NULL,
    ubicacion_calle character varying(255) NOT NULL,
    ubicacion_numero character varying(20),
    ubicacion_piso character varying(10),
    ubicacion_depto character varying(10),
    ubicacion_barrio character varying(100),
    ubicacion_ciudad character varying(100) NOT NULL,
    ubicacion_provincia character varying(100) NOT NULL,
    ubicacion_codigo_postal character varying(20),
    ubicacion_latitud numeric(10,8),
    ubicacion_longitud numeric(11,8),
    ubicacion_google_id character varying(255),
    ubicacion_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    ubicacion_actualizado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ubicacion OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 22572)
-- Name: ubicacion_ubicacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ubicacion_ubicacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ubicacion_ubicacion_id_seq OWNER TO postgres;

--
-- TOC entry 4020 (class 0 OID 0)
-- Dependencies: 223
-- Name: ubicacion_ubicacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ubicacion_ubicacion_id_seq OWNED BY public.ubicacion.ubicacion_id;


--
-- TOC entry 242 (class 1259 OID 22881)
-- Name: usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario (
    usuario_id integer NOT NULL,
    usuario_nombre text NOT NULL,
    usuario_email text NOT NULL,
    usuario_pass text NOT NULL,
    usuario_estado_id integer NOT NULL,
    usuario_rol_id integer NOT NULL,
    usuario_ubicacion_id integer,
    usuario_telefono text,
    usuario_avatar_url text,
    usuario_ultimo_login timestamp with time zone,
    usuario_creado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_actualizado_fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuario OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 22880)
-- Name: usuario_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuario_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuario_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 4021 (class 0 OID 0)
-- Dependencies: 241
-- Name: usuario_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuario_usuario_id_seq OWNED BY public.usuario.usuario_id;


--
-- TOC entry 3634 (class 2604 OID 23211)
-- Name: calificaciones_productos calificacion_producto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_productos ALTER COLUMN calificacion_producto_id SET DEFAULT nextval('public.calificaciones_productos_calificacion_producto_id_seq'::regclass);


--
-- TOC entry 3636 (class 2604 OID 23236)
-- Name: calificaciones_reviews calificacion_review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_reviews ALTER COLUMN calificacion_review_id SET DEFAULT nextval('public.calificaciones_reviews_calificacion_review_id_seq'::regclass);


--
-- TOC entry 3585 (class 2604 OID 22857)
-- Name: cliente cliente_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente ALTER COLUMN cliente_id SET DEFAULT nextval('public.cliente_cliente_id_seq'::regclass);


--
-- TOC entry 3572 (class 2604 OID 22619)
-- Name: condicion_iva condicion_iva_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condicion_iva ALTER COLUMN condicion_iva_id SET DEFAULT nextval('public.condicion_iva_condicion_iva_id_seq'::regclass);


--
-- TOC entry 3620 (class 2604 OID 23105)
-- Name: detalle_factura detalle_factura_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_factura ALTER COLUMN detalle_factura_id SET DEFAULT nextval('public.detalle_factura_detalle_factura_id_seq'::regclass);


--
-- TOC entry 3626 (class 2604 OID 23156)
-- Name: detalle_orden detalle_orden_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_orden ALTER COLUMN detalle_orden_id SET DEFAULT nextval('public.detalle_orden_detalle_orden_id_seq'::regclass);


--
-- TOC entry 3581 (class 2604 OID 22829)
-- Name: empresa empresa_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa ALTER COLUMN empresa_id SET DEFAULT nextval('public.empresa_empresa_id_seq'::regclass);


--
-- TOC entry 3575 (class 2604 OID 22632)
-- Name: estado_orden estado_orden_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_orden ALTER COLUMN estado_orden_id SET DEFAULT nextval('public.estado_orden_estado_orden_id_seq'::regclass);


--
-- TOC entry 3579 (class 2604 OID 22660)
-- Name: estado_usuario estado_usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_usuario ALTER COLUMN estado_usuario_id SET DEFAULT nextval('public.estado_usuario_estado_usuario_id_seq'::regclass);


--
-- TOC entry 3568 (class 2604 OID 22591)
-- Name: etiquetas etiqueta_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiquetas ALTER COLUMN etiqueta_id SET DEFAULT nextval('public.etiquetas_etiqueta_id_seq'::regclass);


--
-- TOC entry 3605 (class 2604 OID 23015)
-- Name: factura factura_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura ALTER COLUMN factura_id SET DEFAULT nextval('public.factura_factura_id_seq'::regclass);


--
-- TOC entry 3614 (class 2604 OID 23058)
-- Name: factura_a factura_a_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_a ALTER COLUMN factura_a_id SET DEFAULT nextval('public.factura_a_factura_a_id_seq'::regclass);


--
-- TOC entry 3617 (class 2604 OID 23082)
-- Name: factura_b factura_b_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_b ALTER COLUMN factura_b_id SET DEFAULT nextval('public.factura_b_factura_b_id_seq'::regclass);


--
-- TOC entry 3571 (class 2604 OID 22606)
-- Name: medio_de_pago medio_de_pago_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medio_de_pago ALTER COLUMN medio_de_pago_id SET DEFAULT nextval('public.medio_de_pago_medio_de_pago_id_seq'::regclass);


--
-- TOC entry 3600 (class 2604 OID 22984)
-- Name: orden orden_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden ALTER COLUMN orden_id SET DEFAULT nextval('public.orden_orden_id_seq'::regclass);


--
-- TOC entry 3623 (class 2604 OID 23128)
-- Name: pago pago_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago ALTER COLUMN pago_id SET DEFAULT nextval('public.pago_pago_id_seq'::regclass);


--
-- TOC entry 3592 (class 2604 OID 22918)
-- Name: producto producto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto ALTER COLUMN producto_id SET DEFAULT nextval('public.producto_producto_id_seq'::regclass);


--
-- TOC entry 3629 (class 2604 OID 23183)
-- Name: reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN review_id SET DEFAULT nextval('public.reviews_review_id_seq'::regclass);


--
-- TOC entry 3577 (class 2604 OID 22646)
-- Name: rol_usuario rol_usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_usuario ALTER COLUMN rol_usuario_id SET DEFAULT nextval('public.rol_usuario_rol_usuario_id_seq'::regclass);


--
-- TOC entry 3565 (class 2604 OID 22576)
-- Name: ubicacion ubicacion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion ALTER COLUMN ubicacion_id SET DEFAULT nextval('public.ubicacion_ubicacion_id_seq'::regclass);


--
-- TOC entry 3589 (class 2604 OID 22884)
-- Name: usuario usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuario_usuario_id_seq'::regclass);


--
-- TOC entry 3938 (class 0 OID 23208)
-- Dependencies: 262
-- Data for Name: calificaciones_productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calificaciones_productos (calificacion_producto_id, calificacion_producto_valor, calificacion_producto_producto_id, calificacion_producto_usuario_id, calificacion_producto_fecha) FROM stdin;
\.


--
-- TOC entry 3940 (class 0 OID 23233)
-- Dependencies: 264
-- Data for Name: calificaciones_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.calificaciones_reviews (calificacion_review_id, calificacion_review_valor, calificacion_review_review_id, calificacion_review_usuario_id, calificacion_review_fecha) FROM stdin;
\.


--
-- TOC entry 3916 (class 0 OID 22854)
-- Dependencies: 240
-- Data for Name: cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cliente (cliente_id, cliente_nombre, cliente_email, cliente_telefono, cliente_cuit, cliente_dni, cliente_condicion_iva_id, cliente_ubicacion_id, cliente_activo, cliente_creado_fecha, cliente_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3906 (class 0 OID 22616)
-- Dependencies: 230
-- Data for Name: condicion_iva; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.condicion_iva (condicion_iva_id, condicion_iva_nombre, condicion_iva_codigo, condicion_iva_discrimina_iva, condicion_iva_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3930 (class 0 OID 23102)
-- Dependencies: 254
-- Data for Name: detalle_factura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_factura (detalle_factura_id, detalle_factura_factura_id, detalle_factura_descripcion, detalle_factura_cantidad, detalle_factura_precio_unitario, detalle_factura_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3934 (class 0 OID 23153)
-- Dependencies: 258
-- Data for Name: detalle_orden; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_orden (detalle_orden_id, detalle_orden_orden_id, detalle_orden_producto_id, detalle_orden_descripcion, detalle_orden_cantidad, detalle_orden_precio_unitario, detalle_orden_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3914 (class 0 OID 22826)
-- Dependencies: 238
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa (empresa_id, empresa_razon_social, empresa_cuit, empresa_condicion_iva_id, empresa_ubicacion_id, empresa_telefono, empresa_email, empresa_web, empresa_logo_url, empresa_activo, empresa_creado_fecha, empresa_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3908 (class 0 OID 22629)
-- Dependencies: 232
-- Data for Name: estado_orden; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_orden (estado_orden_id, estado_orden_nombre, estado_orden_descripcion, estado_orden_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3912 (class 0 OID 22657)
-- Dependencies: 236
-- Data for Name: estado_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estado_usuario (estado_usuario_id, estado_usuario_nombre, estado_usuario_descripcion, estado_usuario_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3902 (class 0 OID 22588)
-- Dependencies: 226
-- Data for Name: etiquetas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.etiquetas (etiqueta_id, etiqueta_nombre, etiqueta_descripcion, etiqueta_creado_fecha, etiqueta_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3924 (class 0 OID 23012)
-- Dependencies: 248
-- Data for Name: factura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.factura (factura_id, factura_tipo, factura_numero, factura_punto_venta, factura_fecha_emision, factura_fecha_vencimiento, factura_empresa_id, factura_cliente_id, factura_orden_id, factura_condicion_pago, factura_moneda, factura_cotizacion, factura_subtotal, factura_descuento, factura_neto_gravado, factura_iva_monto, factura_percepciones, factura_total, factura_cae, factura_cae_vencimiento, factura_afip_respuesta, factura_qr_data, factura_pdf_url, factura_creado_fecha, factura_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3926 (class 0 OID 23055)
-- Dependencies: 250
-- Data for Name: factura_a; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.factura_a (factura_a_id, factura_a_factura_id, factura_a_cliente_dni, factura_a_cliente_nombre, factura_a_cliente_direccion, factura_a_cliente_condicion_iva, factura_a_iva_discriminado, factura_a_percepciones, factura_a_observaciones, factura_a_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3928 (class 0 OID 23079)
-- Dependencies: 252
-- Data for Name: factura_b; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.factura_b (factura_b_id, factura_b_factura_id, factura_b_cliente_dni, factura_b_cliente_nombre, factura_b_cliente_direccion, factura_b_cliente_condicion_iva, factura_b_iva_incluido, factura_b_descuento, factura_b_observaciones, factura_b_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3904 (class 0 OID 22603)
-- Dependencies: 228
-- Data for Name: medio_de_pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medio_de_pago (medio_de_pago_id, medio_de_pago_nombre) FROM stdin;
\.


--
-- TOC entry 3922 (class 0 OID 22981)
-- Dependencies: 246
-- Data for Name: orden; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orden (orden_id, orden_usuario_id, orden_cliente_id, orden_fecha, orden_estado_id, orden_subtotal, orden_descuento, orden_total, orden_descripcion, orden_creado_fecha, orden_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3932 (class 0 OID 23125)
-- Dependencies: 256
-- Data for Name: pago; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pago (pago_id, pago_factura_id, pago_medio_de_pago_id, pago_monto, pago_fecha, pago_descripcion, pago_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3920 (class 0 OID 22915)
-- Dependencies: 244
-- Data for Name: producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.producto (producto_id, producto_nombre, producto_descripcion, producto_tipo, producto_formato, producto_tamano_mb, producto_url_descarga, producto_licencia, producto_fecha_creacion, producto_imagen_url, producto_descuento, producto_precio, producto_moneda, producto_etiqueta_id, producto_activo, producto_creado_fecha, producto_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3936 (class 0 OID 23180)
-- Dependencies: 260
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (review_id, review_texto, review_fecha, review_usuario_id, review_producto_id, review_activo, review_creado_fecha, review_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3910 (class 0 OID 22643)
-- Dependencies: 234
-- Data for Name: rol_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol_usuario (rol_usuario_id, rol_usuario_nombre, rol_usuario_descripcion, rol_usuario_permisos, rol_usuario_creado_fecha) FROM stdin;
\.


--
-- TOC entry 3900 (class 0 OID 22573)
-- Dependencies: 224
-- Data for Name: ubicacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ubicacion (ubicacion_id, ubicacion_calle, ubicacion_numero, ubicacion_piso, ubicacion_depto, ubicacion_barrio, ubicacion_ciudad, ubicacion_provincia, ubicacion_codigo_postal, ubicacion_latitud, ubicacion_longitud, ubicacion_google_id, ubicacion_creado_fecha, ubicacion_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 3918 (class 0 OID 22881)
-- Dependencies: 242
-- Data for Name: usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario (usuario_id, usuario_nombre, usuario_email, usuario_pass, usuario_estado_id, usuario_rol_id, usuario_ubicacion_id, usuario_telefono, usuario_avatar_url, usuario_ultimo_login, usuario_creado_fecha, usuario_actualizado_fecha) FROM stdin;
\.


--
-- TOC entry 4022 (class 0 OID 0)
-- Dependencies: 261
-- Name: calificaciones_productos_calificacion_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calificaciones_productos_calificacion_producto_id_seq', 1, false);


--
-- TOC entry 4023 (class 0 OID 0)
-- Dependencies: 263
-- Name: calificaciones_reviews_calificacion_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.calificaciones_reviews_calificacion_review_id_seq', 1, false);


--
-- TOC entry 4024 (class 0 OID 0)
-- Dependencies: 239
-- Name: cliente_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cliente_cliente_id_seq', 1, false);


--
-- TOC entry 4025 (class 0 OID 0)
-- Dependencies: 229
-- Name: condicion_iva_condicion_iva_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.condicion_iva_condicion_iva_id_seq', 1, false);


--
-- TOC entry 4026 (class 0 OID 0)
-- Dependencies: 253
-- Name: detalle_factura_detalle_factura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_factura_detalle_factura_id_seq', 1, false);


--
-- TOC entry 4027 (class 0 OID 0)
-- Dependencies: 257
-- Name: detalle_orden_detalle_orden_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_orden_detalle_orden_id_seq', 1, false);


--
-- TOC entry 4028 (class 0 OID 0)
-- Dependencies: 237
-- Name: empresa_empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresa_empresa_id_seq', 1, false);


--
-- TOC entry 4029 (class 0 OID 0)
-- Dependencies: 231
-- Name: estado_orden_estado_orden_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_orden_estado_orden_id_seq', 1, false);


--
-- TOC entry 4030 (class 0 OID 0)
-- Dependencies: 235
-- Name: estado_usuario_estado_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estado_usuario_estado_usuario_id_seq', 1, false);


--
-- TOC entry 4031 (class 0 OID 0)
-- Dependencies: 225
-- Name: etiquetas_etiqueta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etiquetas_etiqueta_id_seq', 1, false);


--
-- TOC entry 4032 (class 0 OID 0)
-- Dependencies: 249
-- Name: factura_a_factura_a_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.factura_a_factura_a_id_seq', 1, false);


--
-- TOC entry 4033 (class 0 OID 0)
-- Dependencies: 251
-- Name: factura_b_factura_b_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.factura_b_factura_b_id_seq', 1, false);


--
-- TOC entry 4034 (class 0 OID 0)
-- Dependencies: 247
-- Name: factura_factura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.factura_factura_id_seq', 1, false);


--
-- TOC entry 4035 (class 0 OID 0)
-- Dependencies: 227
-- Name: medio_de_pago_medio_de_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medio_de_pago_medio_de_pago_id_seq', 1, false);


--
-- TOC entry 4036 (class 0 OID 0)
-- Dependencies: 245
-- Name: orden_orden_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orden_orden_id_seq', 1, false);


--
-- TOC entry 4037 (class 0 OID 0)
-- Dependencies: 255
-- Name: pago_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pago_pago_id_seq', 1, false);


--
-- TOC entry 4038 (class 0 OID 0)
-- Dependencies: 243
-- Name: producto_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.producto_producto_id_seq', 1, false);


--
-- TOC entry 4039 (class 0 OID 0)
-- Dependencies: 259
-- Name: reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reviews_review_id_seq', 1, false);


--
-- TOC entry 4040 (class 0 OID 0)
-- Dependencies: 233
-- Name: rol_usuario_rol_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rol_usuario_rol_usuario_id_seq', 1, false);


--
-- TOC entry 4041 (class 0 OID 0)
-- Dependencies: 223
-- Name: ubicacion_ubicacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ubicacion_ubicacion_id_seq', 1, false);


--
-- TOC entry 4042 (class 0 OID 0)
-- Dependencies: 241
-- Name: usuario_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuario_usuario_id_seq', 1, false);


--
-- TOC entry 3718 (class 2606 OID 23219)
-- Name: calificaciones_productos calificaciones_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_productos
    ADD CONSTRAINT calificaciones_productos_pkey PRIMARY KEY (calificacion_producto_id);


--
-- TOC entry 3722 (class 2606 OID 23244)
-- Name: calificaciones_reviews calificaciones_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_reviews
    ADD CONSTRAINT calificaciones_reviews_pkey PRIMARY KEY (calificacion_review_id);


--
-- TOC entry 3678 (class 2606 OID 22869)
-- Name: cliente cliente_cliente_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_cliente_email_key UNIQUE (cliente_email);


--
-- TOC entry 3680 (class 2606 OID 22867)
-- Name: cliente cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_pkey PRIMARY KEY (cliente_id);


--
-- TOC entry 3658 (class 2606 OID 22627)
-- Name: condicion_iva condicion_iva_condicion_iva_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condicion_iva
    ADD CONSTRAINT condicion_iva_condicion_iva_nombre_key UNIQUE (condicion_iva_nombre);


--
-- TOC entry 3660 (class 2606 OID 22625)
-- Name: condicion_iva condicion_iva_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.condicion_iva
    ADD CONSTRAINT condicion_iva_pkey PRIMARY KEY (condicion_iva_id);


--
-- TOC entry 3707 (class 2606 OID 23118)
-- Name: detalle_factura detalle_factura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_factura
    ADD CONSTRAINT detalle_factura_pkey PRIMARY KEY (detalle_factura_id);


--
-- TOC entry 3712 (class 2606 OID 23168)
-- Name: detalle_orden detalle_orden_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_orden
    ADD CONSTRAINT detalle_orden_pkey PRIMARY KEY (detalle_orden_id);


--
-- TOC entry 3674 (class 2606 OID 22842)
-- Name: empresa empresa_empresa_cuit_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_empresa_cuit_key UNIQUE (empresa_cuit);


--
-- TOC entry 3676 (class 2606 OID 22840)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (empresa_id);


--
-- TOC entry 3662 (class 2606 OID 22641)
-- Name: estado_orden estado_orden_estado_orden_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_orden
    ADD CONSTRAINT estado_orden_estado_orden_nombre_key UNIQUE (estado_orden_nombre);


--
-- TOC entry 3664 (class 2606 OID 22639)
-- Name: estado_orden estado_orden_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_orden
    ADD CONSTRAINT estado_orden_pkey PRIMARY KEY (estado_orden_id);


--
-- TOC entry 3670 (class 2606 OID 22669)
-- Name: estado_usuario estado_usuario_estado_usuario_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_usuario
    ADD CONSTRAINT estado_usuario_estado_usuario_nombre_key UNIQUE (estado_usuario_nombre);


--
-- TOC entry 3672 (class 2606 OID 22667)
-- Name: estado_usuario estado_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estado_usuario
    ADD CONSTRAINT estado_usuario_pkey PRIMARY KEY (estado_usuario_id);


--
-- TOC entry 3650 (class 2606 OID 22601)
-- Name: etiquetas etiquetas_etiqueta_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiquetas
    ADD CONSTRAINT etiquetas_etiqueta_nombre_key UNIQUE (etiqueta_nombre);


--
-- TOC entry 3652 (class 2606 OID 22599)
-- Name: etiquetas etiquetas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.etiquetas
    ADD CONSTRAINT etiquetas_pkey PRIMARY KEY (etiqueta_id);


--
-- TOC entry 3699 (class 2606 OID 23072)
-- Name: factura_a factura_a_factura_a_factura_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_a
    ADD CONSTRAINT factura_a_factura_a_factura_id_key UNIQUE (factura_a_factura_id);


--
-- TOC entry 3701 (class 2606 OID 23070)
-- Name: factura_a factura_a_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_a
    ADD CONSTRAINT factura_a_pkey PRIMARY KEY (factura_a_id);


--
-- TOC entry 3703 (class 2606 OID 23095)
-- Name: factura_b factura_b_factura_b_factura_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_b
    ADD CONSTRAINT factura_b_factura_b_factura_id_key UNIQUE (factura_b_factura_id);


--
-- TOC entry 3705 (class 2606 OID 23093)
-- Name: factura_b factura_b_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_b
    ADD CONSTRAINT factura_b_pkey PRIMARY KEY (factura_b_id);


--
-- TOC entry 3694 (class 2606 OID 23038)
-- Name: factura factura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_pkey PRIMARY KEY (factura_id);


--
-- TOC entry 3654 (class 2606 OID 22614)
-- Name: medio_de_pago medio_de_pago_medio_de_pago_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medio_de_pago
    ADD CONSTRAINT medio_de_pago_medio_de_pago_nombre_key UNIQUE (medio_de_pago_nombre);


--
-- TOC entry 3656 (class 2606 OID 22612)
-- Name: medio_de_pago medio_de_pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medio_de_pago
    ADD CONSTRAINT medio_de_pago_pkey PRIMARY KEY (medio_de_pago_id);


--
-- TOC entry 3692 (class 2606 OID 22995)
-- Name: orden orden_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden
    ADD CONSTRAINT orden_pkey PRIMARY KEY (orden_id);


--
-- TOC entry 3710 (class 2606 OID 23140)
-- Name: pago pago_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pkey PRIMARY KEY (pago_id);


--
-- TOC entry 3687 (class 2606 OID 22936)
-- Name: producto producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_pkey PRIMARY KEY (producto_id);


--
-- TOC entry 3716 (class 2606 OID 23196)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 3666 (class 2606 OID 22653)
-- Name: rol_usuario rol_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_usuario
    ADD CONSTRAINT rol_usuario_pkey PRIMARY KEY (rol_usuario_id);


--
-- TOC entry 3668 (class 2606 OID 22655)
-- Name: rol_usuario rol_usuario_rol_usuario_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_usuario
    ADD CONSTRAINT rol_usuario_rol_usuario_nombre_key UNIQUE (rol_usuario_nombre);


--
-- TOC entry 3648 (class 2606 OID 22586)
-- Name: ubicacion ubicacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ubicacion
    ADD CONSTRAINT ubicacion_pkey PRIMARY KEY (ubicacion_id);


--
-- TOC entry 3720 (class 2606 OID 23221)
-- Name: calificaciones_productos uk_calificacion_producto_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_productos
    ADD CONSTRAINT uk_calificacion_producto_usuario UNIQUE (calificacion_producto_producto_id, calificacion_producto_usuario_id);


--
-- TOC entry 3724 (class 2606 OID 23246)
-- Name: calificaciones_reviews uk_calificacion_review_usuario; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_reviews
    ADD CONSTRAINT uk_calificacion_review_usuario UNIQUE (calificacion_review_review_id, calificacion_review_usuario_id);


--
-- TOC entry 3682 (class 2606 OID 22896)
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 3684 (class 2606 OID 22898)
-- Name: usuario usuario_usuario_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_usuario_email_key UNIQUE (usuario_email);


--
-- TOC entry 3708 (class 1259 OID 23260)
-- Name: idx_detalle_factura_factura; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_detalle_factura_factura ON public.detalle_factura USING btree (detalle_factura_factura_id);


--
-- TOC entry 3695 (class 1259 OID 23257)
-- Name: idx_factura_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_factura_cliente ON public.factura USING btree (factura_cliente_id);


--
-- TOC entry 3696 (class 1259 OID 23258)
-- Name: idx_factura_empresa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_factura_empresa ON public.factura USING btree (factura_empresa_id);


--
-- TOC entry 3697 (class 1259 OID 23259)
-- Name: idx_factura_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_factura_fecha ON public.factura USING btree (factura_fecha_emision);


--
-- TOC entry 3688 (class 1259 OID 23261)
-- Name: idx_orden_cliente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orden_cliente ON public.orden USING btree (orden_cliente_id);


--
-- TOC entry 3689 (class 1259 OID 23263)
-- Name: idx_orden_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orden_estado ON public.orden USING btree (orden_estado_id);


--
-- TOC entry 3690 (class 1259 OID 23262)
-- Name: idx_orden_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orden_usuario ON public.orden USING btree (orden_usuario_id);


--
-- TOC entry 3685 (class 1259 OID 23264)
-- Name: idx_producto_etiqueta; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_producto_etiqueta ON public.producto USING btree (producto_etiqueta_id);


--
-- TOC entry 3713 (class 1259 OID 23265)
-- Name: idx_reviews_producto; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_producto ON public.reviews USING btree (review_producto_id);


--
-- TOC entry 3714 (class 1259 OID 23266)
-- Name: idx_reviews_usuario; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_usuario ON public.reviews USING btree (review_usuario_id);


--
-- TOC entry 3748 (class 2606 OID 23222)
-- Name: calificaciones_productos calificaciones_productos_calificacion_producto_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_productos
    ADD CONSTRAINT calificaciones_productos_calificacion_producto_producto_id_fkey FOREIGN KEY (calificacion_producto_producto_id) REFERENCES public.producto(producto_id) ON DELETE CASCADE;


--
-- TOC entry 3749 (class 2606 OID 23227)
-- Name: calificaciones_productos calificaciones_productos_calificacion_producto_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_productos
    ADD CONSTRAINT calificaciones_productos_calificacion_producto_usuario_id_fkey FOREIGN KEY (calificacion_producto_usuario_id) REFERENCES public.usuario(usuario_id) ON DELETE CASCADE;


--
-- TOC entry 3750 (class 2606 OID 23247)
-- Name: calificaciones_reviews calificaciones_reviews_calificacion_review_review_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_reviews
    ADD CONSTRAINT calificaciones_reviews_calificacion_review_review_id_fkey FOREIGN KEY (calificacion_review_review_id) REFERENCES public.reviews(review_id) ON DELETE CASCADE;


--
-- TOC entry 3751 (class 2606 OID 23252)
-- Name: calificaciones_reviews calificaciones_reviews_calificacion_review_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.calificaciones_reviews
    ADD CONSTRAINT calificaciones_reviews_calificacion_review_usuario_id_fkey FOREIGN KEY (calificacion_review_usuario_id) REFERENCES public.usuario(usuario_id) ON DELETE CASCADE;


--
-- TOC entry 3727 (class 2606 OID 22870)
-- Name: cliente cliente_cliente_condicion_iva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_cliente_condicion_iva_id_fkey FOREIGN KEY (cliente_condicion_iva_id) REFERENCES public.condicion_iva(condicion_iva_id);


--
-- TOC entry 3728 (class 2606 OID 22875)
-- Name: cliente cliente_cliente_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cliente
    ADD CONSTRAINT cliente_cliente_ubicacion_id_fkey FOREIGN KEY (cliente_ubicacion_id) REFERENCES public.ubicacion(ubicacion_id) ON DELETE SET NULL;


--
-- TOC entry 3741 (class 2606 OID 23119)
-- Name: detalle_factura detalle_factura_detalle_factura_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_factura
    ADD CONSTRAINT detalle_factura_detalle_factura_factura_id_fkey FOREIGN KEY (detalle_factura_factura_id) REFERENCES public.factura(factura_id) ON DELETE CASCADE;


--
-- TOC entry 3744 (class 2606 OID 23169)
-- Name: detalle_orden detalle_orden_detalle_orden_orden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_orden
    ADD CONSTRAINT detalle_orden_detalle_orden_orden_id_fkey FOREIGN KEY (detalle_orden_orden_id) REFERENCES public.orden(orden_id) ON DELETE CASCADE;


--
-- TOC entry 3745 (class 2606 OID 23174)
-- Name: detalle_orden detalle_orden_detalle_orden_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_orden
    ADD CONSTRAINT detalle_orden_detalle_orden_producto_id_fkey FOREIGN KEY (detalle_orden_producto_id) REFERENCES public.producto(producto_id) ON DELETE SET NULL;


--
-- TOC entry 3725 (class 2606 OID 22843)
-- Name: empresa empresa_empresa_condicion_iva_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_empresa_condicion_iva_id_fkey FOREIGN KEY (empresa_condicion_iva_id) REFERENCES public.condicion_iva(condicion_iva_id);


--
-- TOC entry 3726 (class 2606 OID 22848)
-- Name: empresa empresa_empresa_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_empresa_ubicacion_id_fkey FOREIGN KEY (empresa_ubicacion_id) REFERENCES public.ubicacion(ubicacion_id) ON DELETE SET NULL;


--
-- TOC entry 3739 (class 2606 OID 23073)
-- Name: factura_a factura_a_factura_a_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_a
    ADD CONSTRAINT factura_a_factura_a_factura_id_fkey FOREIGN KEY (factura_a_factura_id) REFERENCES public.factura(factura_id) ON DELETE CASCADE;


--
-- TOC entry 3740 (class 2606 OID 23096)
-- Name: factura_b factura_b_factura_b_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura_b
    ADD CONSTRAINT factura_b_factura_b_factura_id_fkey FOREIGN KEY (factura_b_factura_id) REFERENCES public.factura(factura_id) ON DELETE CASCADE;


--
-- TOC entry 3736 (class 2606 OID 23044)
-- Name: factura factura_factura_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_factura_cliente_id_fkey FOREIGN KEY (factura_cliente_id) REFERENCES public.cliente(cliente_id) ON DELETE CASCADE;


--
-- TOC entry 3737 (class 2606 OID 23039)
-- Name: factura factura_factura_empresa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_factura_empresa_id_fkey FOREIGN KEY (factura_empresa_id) REFERENCES public.empresa(empresa_id) ON DELETE CASCADE;


--
-- TOC entry 3738 (class 2606 OID 23049)
-- Name: factura factura_factura_orden_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.factura
    ADD CONSTRAINT factura_factura_orden_id_fkey FOREIGN KEY (factura_orden_id) REFERENCES public.orden(orden_id);


--
-- TOC entry 3733 (class 2606 OID 23001)
-- Name: orden orden_orden_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden
    ADD CONSTRAINT orden_orden_cliente_id_fkey FOREIGN KEY (orden_cliente_id) REFERENCES public.cliente(cliente_id) ON DELETE SET NULL;


--
-- TOC entry 3734 (class 2606 OID 23006)
-- Name: orden orden_orden_estado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden
    ADD CONSTRAINT orden_orden_estado_id_fkey FOREIGN KEY (orden_estado_id) REFERENCES public.estado_orden(estado_orden_id);


--
-- TOC entry 3735 (class 2606 OID 22996)
-- Name: orden orden_orden_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden
    ADD CONSTRAINT orden_orden_usuario_id_fkey FOREIGN KEY (orden_usuario_id) REFERENCES public.usuario(usuario_id) ON DELETE SET NULL;


--
-- TOC entry 3742 (class 2606 OID 23141)
-- Name: pago pago_pago_factura_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pago_factura_id_fkey FOREIGN KEY (pago_factura_id) REFERENCES public.factura(factura_id) ON DELETE CASCADE;


--
-- TOC entry 3743 (class 2606 OID 23146)
-- Name: pago pago_pago_medio_de_pago_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pago
    ADD CONSTRAINT pago_pago_medio_de_pago_id_fkey FOREIGN KEY (pago_medio_de_pago_id) REFERENCES public.medio_de_pago(medio_de_pago_id) ON DELETE CASCADE;


--
-- TOC entry 3732 (class 2606 OID 22937)
-- Name: producto producto_producto_etiqueta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.producto
    ADD CONSTRAINT producto_producto_etiqueta_id_fkey FOREIGN KEY (producto_etiqueta_id) REFERENCES public.etiquetas(etiqueta_id) ON DELETE CASCADE;


--
-- TOC entry 3746 (class 2606 OID 23202)
-- Name: reviews reviews_review_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_review_producto_id_fkey FOREIGN KEY (review_producto_id) REFERENCES public.producto(producto_id) ON DELETE CASCADE;


--
-- TOC entry 3747 (class 2606 OID 23197)
-- Name: reviews reviews_review_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_review_usuario_id_fkey FOREIGN KEY (review_usuario_id) REFERENCES public.usuario(usuario_id) ON DELETE CASCADE;


--
-- TOC entry 3729 (class 2606 OID 22899)
-- Name: usuario usuario_usuario_estado_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_usuario_estado_id_fkey FOREIGN KEY (usuario_estado_id) REFERENCES public.estado_usuario(estado_usuario_id);


--
-- TOC entry 3730 (class 2606 OID 22904)
-- Name: usuario usuario_usuario_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_usuario_rol_id_fkey FOREIGN KEY (usuario_rol_id) REFERENCES public.rol_usuario(rol_usuario_id);


--
-- TOC entry 3731 (class 2606 OID 22909)
-- Name: usuario usuario_usuario_ubicacion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_usuario_ubicacion_id_fkey FOREIGN KEY (usuario_ubicacion_id) REFERENCES public.ubicacion(ubicacion_id) ON DELETE SET NULL;


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 334
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea) TO benteveo_admin;


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 289
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.armor(bytea, text[], text[]) TO benteveo_admin;


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 311
-- Name: FUNCTION calculate_invoice_totals(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_invoice_totals() TO benteveo_admin;


--
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 280
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.crypt(text, text) TO benteveo_admin;


--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 294
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.dearmor(text) TO benteveo_admin;


--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 306
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt(bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 281
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.decrypt_iv(bytea, bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 315
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(bytea, text) TO benteveo_admin;


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 298
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.digest(text, text) TO benteveo_admin;


--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 302
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt(bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 292
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.encrypt_iv(bytea, bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 354
-- Name: FUNCTION fips_mode(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fips_mode() TO benteveo_admin;


--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 330
-- Name: FUNCTION fn_list_tables(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.fn_list_tables() TO benteveo_admin;


--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 275
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_bytes(integer) TO benteveo_admin;


--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 352
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_random_uuid() TO benteveo_admin;


--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 324
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text) TO benteveo_admin;


--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 353
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.gen_salt(text, integer) TO benteveo_admin;


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 307
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 312
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.hmac(text, text, text) TO benteveo_admin;


--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 319
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_armor_headers(text, OUT key text, OUT value text) TO benteveo_admin;


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 283
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_key_id(bytea) TO benteveo_admin;


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 355
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea) TO benteveo_admin;


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 356
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 272
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt(bytea, bytea, text, text) TO benteveo_admin;


--
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 336
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea) TO benteveo_admin;


--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 286
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 274
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO benteveo_admin;


--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 297
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea) TO benteveo_admin;


--
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 305
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt(text, bytea, text) TO benteveo_admin;


--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 273
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea) TO benteveo_admin;


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 268
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_pub_encrypt_bytea(bytea, bytea, text) TO benteveo_admin;


--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 271
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text) TO benteveo_admin;


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 267
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt(bytea, text, text) TO benteveo_admin;


--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 326
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text) TO benteveo_admin;


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 322
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_decrypt_bytea(bytea, text, text) TO benteveo_admin;


--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 290
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text) TO benteveo_admin;


--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 316
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt(text, text, text) TO benteveo_admin;


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 347
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text) TO benteveo_admin;


--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 300
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.pgp_sym_encrypt_bytea(bytea, text, text) TO benteveo_admin;


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 331
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO benteveo_admin;


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 350
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1() TO benteveo_admin;


--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 278
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v1mc() TO benteveo_admin;


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 357
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v3(namespace uuid, name text) TO benteveo_admin;


--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 325
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v4() TO benteveo_admin;


--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 342
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_generate_v5(namespace uuid, name text) TO benteveo_admin;


--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 328
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_nil() TO benteveo_admin;


--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 341
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_dns() TO benteveo_admin;


--
-- TOC entry 3997 (class 0 OID 0)
-- Dependencies: 323
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_oid() TO benteveo_admin;


--
-- TOC entry 3998 (class 0 OID 0)
-- Dependencies: 349
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_url() TO benteveo_admin;


--
-- TOC entry 3999 (class 0 OID 0)
-- Dependencies: 296
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.uuid_ns_x500() TO benteveo_admin;


--
-- TOC entry 4000 (class 0 OID 0)
-- Dependencies: 295
-- Name: FUNCTION validate_invoice_number(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_invoice_number() TO benteveo_admin;


-- Completed on 2025-10-07 18:08:35 -03

--
-- PostgreSQL database dump complete
--

\unrestrict 2f9c3srAg47N0TDVyjpbyMp5CwTPqONeHTGnWGJFCoEtRQcuE98wvNYTLNcOVfA

