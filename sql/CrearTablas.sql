use ARTEPREF

CREATE TABLE AceroCerramientos (
    idCerramiento       INT PRIMARY KEY IDENTITY(1,1),
    Tipo     NUMERIC(4, 0),
    Posicion VARCHAR(2),
    Diametro NUMERIC(2, 0) null,
    Numero   NUMERIC(2, 0) null,
    Longitud NUMERIC(4, 0) null,
    idObra   INT,
    FOREIGN KEY (idObra)
        REFERENCES ObrasArtepref(idObra)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);