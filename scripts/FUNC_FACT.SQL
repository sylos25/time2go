CREATE OR REPLACE FUNCTION fun_total_pagar(

) RETURNS BOOLEAN AS
$$
DECLARE iva CONSTANT NUMERIC:= 0.19
BEGIN
    NEW.total_pagar = (NEW.valor_entrada + (NEW.valor_entrada * iva)) * NEW.cant_entrada;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calc_total_pagar BEFORE INSERT OR UPDATE ON tabla_pagos FOR
EACH ROW EXECUTE fun_total_pagar;