use -;


create table cerramientos{
    int PRIMARY KEY AUTO_INCREMENT,
    tipo NUMERIC(4, 0),
    posicion VARCHAR(2),
    diametro NUMERIC(2,0),
    numero NUMERIC(2,0),
    longitud NUMERIC(4,0)
    --obras_id int

    FOREIGN KEY (obra_id)
        REFERENCES obra(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
}