use ARTEPREF

/*Crear tabla AceroCerramientos*/
CREATE TABLE AceroCerramientos (
    idCerramiento INT PRIMARY KEY IDENTITY(1,1),
    Tipo          VARCHAR(5),
    Posicion      VARCHAR(2),
    Diametro      NUMERIC(2, 0) null,
    Numero        NUMERIC(2, 0) null,
    Longitud      NUMERIC(4, 0) null,
    nombreObra    VARCHAR(50),
);

/*Consulta comprobacion corrugado*/ 
SELECT 
    ac.nombreObra,
    ac.Tipo,
    ROUND(SUM(PI() * POWER(ac.Diametro / 20.0, 2) * 0.785 * (ac.Longitud/100) * ac.Numero), 2) AS totalCorrugado,
    atr.Corrugado,
    CASE 
        WHEN ABS(
            ROUND(SUM(PI() * POWER(ac.Diametro / 20.0, 2) * 0.785 * (ac.Longitud/100) * ac.Numero), 2)
            - atr.Corrugado)/atr.Corrugado
        
        <= 0.05 --Tolerancia que quieras permitir
        THEN 'CORRECTO'
        ELSE 'ERROR'
    END AS comprobacion
FROM AceroCerramientos ac
INNER JOIN AtributosSimple atr ON ac.nombreObra = atr.Obra AND ac.Tipo = atr.Tipo
where ac.nombreObra = 'Dia ANTEQUERA'--Nombre de la obra
GROUP BY ac.nombreObra, ac.Tipo, atr.Corrugado
order by ac.Tipo;

/*Solo los cerramientos con corrugado erroneo*/
SELECT ac.nombreObra, ac.Tipo, ROUND(SUM(PI() * POWER(ac.Diametro / 20.0, 2) * 0.785 * (ac.Longitud/100) * ac.Numero), 2) AS totalCorrugado,
    atr.Corrugado
FROM AceroCerramientos ac
INNER JOIN AtributosSimple atr ON ac.nombreObra = atr.Obra AND ac.Tipo = atr.Tipo
where ac.nombreObra = 'Dia ANTEQUERA'--Nombre de la obra
GROUP BY ac.nombreObra, ac.Tipo, atr.Corrugado
HAVING ABS(
    ROUND(SUM(PI() * POWER(ac.Diametro / 20.0, 2) * 0.785 * (ac.Longitud/100) * ac.Numero), 2)
    - atr.Corrugado) / atr.Corrugado > 0.05
order by ac.Tipo;
