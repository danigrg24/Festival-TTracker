const sql = require("mssql/msnodesqlv8");
var config = {
    server: "DESKTOP-G1P5RB8\\SQLEXPRESS",
    database: "Companie Festivaluri",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true
    }
}

sql.connect(config, function (err) {
    if (err) {
        console.log(err);
        return; // Adaugă această linie pentru a opri execuția dacă conectarea eșuează
    }
    var request = new sql.Request();
    request.query("select * from Artisti", function (err, records) {
        if (err) console.log(err)
        console.log(records);
    });

    request.query("select * from Participanti", function (err, records) {
        if (err) console.log(err)
        console.log(records);
    });

    request.query("select * from Program", function (err, records) {
        if (err) console.log(err)
        console.log(records);
    });

    request.query("select * from Recenzii", function (err, records) {
        if (err) console.log(err)
        console.log(records);
    });

    request.query("select * from ParticipantiFestivaluri", function (err, records) {
        if (err) console.log(err)
        console.log(records);
    });

    request.query("select * from Bilete", function (err, records) {
        if (err) console.log(err)
        console.log(records);
    });

    request.query("select * from Festivaluri", function (err, records) {
        if (err) console.log(err)
        console.log(records);
    });
});