const express = require('express');
const session = require('express-session');
const sql = require("mssql/msnodesqlv8");

const app = express();
const port = 3000;
app.use(express.static('views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // pentru a putea accesa datele din formularul de login
app.use(session({
    secret: 'your secret key',
    resave: false,
    saveUninitialized: false
}));

var config = {
    server: "DESKTOP-G1P5RB8\\SQLEXPRESS",
    database: "Companie Festivaluri",
    driver: "msnodesqlv8",
    options: {
        trustedConnection: true
    }
}

app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/dashboard');
    } else {
        res.render('login');
    }
});

app.get('/error', function(req, res) {
    res.render('error');
});

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    sql.connect(config, function (err) {
        if (err) {
            console.log(err);
            return;
        }
        var request = new sql.Request();
        request.query(`SELECT * FROM Participanti WHERE Nume = '${username}' AND Parola = '${password}'`, function (err, result) {
            if (err) console.log(err)
            console.log(result);
            console.log(result.recordset.length);
            if (result.recordset.length > 0) {
                req.session.user = username; // setează req.session.user
                res.redirect('/tables'); // redirecționează utilizatorul către '/tables'
            } else {
                console.log('Invalid username or password');
                res.redirect('/error');
            }
        });
    });
});


app.get("/tables", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var request = new sql.Request();
      request.query("select * from Festivaluri", function (error, firstSet) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        var anotherRequest = new sql.Request();
        anotherRequest.query("select * from Program", function (error, secondSet) {
          if (error) {
            console.log(error);
            res.send("Error querying the database");
            sql.close();
            return;
          }
  
          var thirdRequest = new sql.Request();
          thirdRequest.query("select * from Artisti", function (error, thirdSet) {
            if (error) {
              console.log(error);
              res.send("Error querying the database");
              sql.close();
              return;
            }
  
            var fourthRequest = new sql.Request();
            fourthRequest.query("select * from Participanti", function (error, fourthSet) {
              if (error) {
                console.log(error);
                res.send("Error querying the database");
                sql.close();
                return;
              }
  
              var fifthRequest = new sql.Request();
              fifthRequest.query("select * from ParticipantiFestivaluri", function (error, fifthSet) {
                if (error) {
                  console.log(error);
                  res.send("Error querying the database");
                  sql.close();
                  return;
                }
  
                var sixthRequest = new sql.Request();
                sixthRequest.query("select * from Recenzii", function (error, sixthSet) {
                  if (error) {
                    console.log(error);
                    res.send("Error querying the database");
                    sql.close();
                    return;
                  }

                var seventhRequest = new sql.Request();
                seventhRequest.query("select * from Bilete", function (error, seventhSet) {
                    if (error) {
                        console.log(error);
                        res.send("Error querying the database");
                        sql.close();
                        return;
                    }  
  
                  res.render("tables", { 
                    firstSet: firstSet.recordset, 
                    secondSet: secondSet.recordset, 
                    thirdSet: thirdSet.recordset,
                    fourthSet: fourthSet.recordset,
                    fifthSet: fifthSet.recordset,
                    sixthSet: sixthSet.recordset,
                    seventhSet: seventhSet.recordset
                  });
  
                  sql.close();
                });
              });
            });
          });
        });
      });
    });
  });
});


app.listen(3000, function () {
    console.log('App is listening on port http://localhost:3000/');
});


// Operatii de INSERT, DELETE SI UPDATE pt Festivaluri

// INSERT Festivaluri
app.post("/insertFestival", (req, res) => {
    const { festivalID, numeFestival, dataInceput, dataSfarsit, locatie } = req.body;
  
    if (!numeFestival || !dataInceput || !dataSfarsit || !locatie) {
      res.status(400).send("Incomplete data for insertion");
      return;
    }
  
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.status(500).send("Error connecting to the database");
        return;
      }
  
      var insertRequest = new sql.Request();
      insertRequest.query(
        `INSERT INTO Festivaluri (FestivalID, NumeFestival, DataInceput, DataSfarsit, Locatie) VALUES ('${festivalID}','${numeFestival}', '${dataInceput}', '${dataSfarsit}', '${locatie}')`,
        function (error, result) {
          if (error) {
            console.log(error);
            res.status(500).send("Error inserting into the database");
          } else {
            res.redirect(req.get('referer'));
          }
          
          sql.close();
        }
      );
    });
  });

// UPDATE Festivaluri
app.post("/updateFestival", (req, res) => {
    
  const { idToUpdate, updatedField, updatedValue } = req.body;

  if (!idToUpdate || !updatedField || !updatedValue) {
    res.status(400).send("Incomplete data for update");
    return;
  }

  sql.connect(config, function (error) {
    if (error) {
      console.log(error);
      res.status(500).send("Error connecting to the database");
      return;
    }

    var updateRequest = new sql.Request();
    updateRequest.query(
      `UPDATE Festivaluri SET ${updatedField} = '${updatedValue}' WHERE FestivalID = '${idToUpdate}'`,
      function (error, result) {
        if (error) {
          console.log(error);
          res.status(500).send("Error updating the database");
        } else {
       res.redirect("/tables");
      }

        sql.close();
      }
    );
  });
});

// DELETE Festivaluri
app.post("/deleteFestival", (req, res) => {
    const { idToDelete } = req.body;
  
    if (!idToDelete) {
      res.status(400).send("Incomplete data for deletion");
      return;
    }
  
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.status(500).send("Error connecting to the database");
        return;
      }
  
      var deleteRequest = new sql.Request();
      deleteRequest.query(`DELETE FROM Festivaluri WHERE FestivalID = '${idToDelete}'`, function (error, result) {
        if (error) {
          console.log(error);
          res.status(500).send("Error deleting from the database");
        } else {
          res.redirect('back');
        }
  
        sql.close();
      });
    });
  });


// INSERT Artisti
app.post("/insertArtist", (req, res) => {
    const { artistID, numeArtist, genMuzical, nationalitate } = req.body;
  
    if (!numeArtist || !genMuzical || !nationalitate) {
      res.status(400).send("Incomplete data for insertion");
      return;
    }
  
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.status(500).send("Error connecting to the database");
        return;
      }
  
      var insertRequest = new sql.Request();
      insertRequest.query(
        `INSERT INTO Artisti (ArtistID, NumeArtist, GenMuzical, Nationalitate) VALUES ('${artistID}','${numeArtist}', '${genMuzical}', '${nationalitate}')`,
        function (error, result) {
          if (error) {
            console.log(error);
            res.status(500).send("Error inserting into the database");
          } else {
            res.redirect(req.get('referer'));
          }
          
          sql.close();
        }
      );
    });
  });

// UPDATE Artisti
app.post("/updateArtist", (req, res) => {
    
  const { idToUpdate, updatedField, updatedValue } = req.body;

  if (!idToUpdate || !updatedField || !updatedValue) {
    res.status(400).send("Incomplete data for update");
    return;
  }

  sql.connect(config, function (error) {
    if (error) {
      console.log(error);
      res.status(500).send("Error connecting to the database");
      return;
    }

    var updateArtistRequest = new sql.Request();
    updateArtistRequest.query(
      `UPDATE Artisti SET ${updatedField} = '${updatedValue}' WHERE ArtistID = '${idToUpdate}'`,
      function (error, result) {
        if (error) {
          console.log(error);
          res.status(500).send("Error updating the database");
        } else {
       res.redirect("/tables");
      }

        sql.close();
      }
    );
  });
});

// DELETE Artisti
app.post("/deleteArtist", (req, res) => {
    const { idToDelete } = req.body;
  
    if (!idToDelete) {
      res.status(400).send("Incomplete data for deletion");
      return;
    }
  
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.status(500).send("Error connecting to the database");
        return;
      }
  
      var deleteRequest = new sql.Request();
      deleteRequest.query(`DELETE FROM Artisti WHERE ArtistID = '${idToDelete}'`, function (error, result) {
        if (error) {
          console.log(error);
          res.status(500).send("Error deleting from the database");
        } else {
          res.redirect('back');
        }
  
        sql.close();
      });
    });
  });

app.post("/updateArtist", (req, res) => {
    const idToUpdate = req.query.idToUpdate;
    res.render("updateArtist", { idToUpdate });
  });

app.post("/updateFestival", (req, res) => {
    const idToUpdate = req.query.idToUpdate;
    res.render("updateFestival", { idToUpdate });
});

// DELETE Artisti
  app.post("/deleteArtist", (req, res) => {
    const { idToDelete } = req.body;
  
    if (!idToDelete) {
      res.status(400).send("Incomplete data for deletion");
      return;
    }
  
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.status(500).send("Error connecting to the database");
        return;
      }
  
      var deleteRequest = new sql.Request();
      deleteRequest.query(`DELETE FROM Artisti WHERE ArtistID = '${idToDelete}'`, function (error, result) {
        if (error) {
          console.log(error);
          res.status(500).send("Error deleting from the database");
        } else {
          res.redirect('back');
        }
  
        sql.close();
      });
    });
  });



// //INTEROGARI SIMPLE - 6

// // -1-
// // Afiseaza orasele care gazduiesc cele mai multe festivaluri in ordine descrescatoare:
app.post("/Interogarea1_simpla", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int1Query = `
        SELECT F.Locatie, COUNT(*) AS NumarFestivaluri
        FROM Festivaluri F
        JOIN Program P ON F.FestivalID = P.FestivalID
        GROUP BY F.Locatie
        ORDER BY NumarFestivaluri DESC;
      `;
  
      var int1Request = new sql.Request();
      int1Request.query(int1Query, function (error, int1Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea1_simpla", { int1Set: int1Set.recordset });
  
        sql.close();
      });
    });
  });

// // -2-
// // afișează data, scena, ora și numele artistului pentru toate evenimentele din cadrul festivalului cu FestivalID 1 (Untold):
app.post("/Interogarea2_simpla", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int2Query = `
        SELECT Program.Data, Program.Scena, Program.Ora, Artisti.NumeArtist
        FROM Program
        INNER JOIN Artisti ON Program.ArtistID = Artisti.ArtistID
        WHERE Program.FestivalID = 1;      
      `;
  
      var int2Request = new sql.Request();
      int2Request.query(int2Query, function (error, int2Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea2_simpla", { int2Set: int2Set.recordset });
  
        sql.close();
      });
    });
  });

// // -3-
// // Afișează numele și comentariul recenziei pentru fiecare festival care are cel puțin o recenzie:
app.post("/Interogarea3_simpla", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int3Query = `
        SELECT F.NumeFestival, R.Comentariu
        FROM Festivaluri F
        LEFT JOIN Recenzii R ON F.FestivalID = R.FestivalID
        WHERE R.FestivalID IS NOT NULL;
      `;
  
      var int3Request = new sql.Request();
      int3Request.query(int3Query, function (error, int3Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea3_simpla", { int3Set: int3Set.recordset });
  
        sql.close();
      });
    });
  });

// // -4-
// // Afișează numele și locația festivalului, precum și numele artistului și
// // scena la care va concerta pentru fiecare înregistrare din tabela Program:
app.post("/Interogarea4_simpla", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int4Query = `
        SELECT F.NumeFestival, F.Locatie, A.NumeArtist, P.Scena
        FROM Program P
        JOIN Festivaluri F ON P.FestivalID = F.FestivalID
        JOIN Artisti A ON P.ArtistID = A.ArtistID;
      `;
  
      var int4Request = new sql.Request();
      int4Request.query(int4Query, function (error, int4Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea4_simpla", { int4Set: int4Set.recordset });
  
        sql.close();
      });
    });
  });

// // -5-
// // INTEROGARE SIMPLA cu camp variabil
// // Afișează numele festivalurilor, locația, numele artistului și scena, precum și
// // ora spectacolului programat, pentru festivalurile care au locația setată la 'Bucuresti':
app.post("/Interogarea5_simpla", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int5Query = `
        SELECT F.NumeFestival, F.Locatie, A.NumeArtist, P.Scena, P.Ora
        FROM Program P
        JOIN Festivaluri F ON P.FestivalID = F.FestivalID
        JOIN Artisti A ON P.ArtistID = A.ArtistID
        WHERE F.Locatie = @locatie;
      `;
  
      var int5Request = new sql.Request();
      int5Request.input('locatie', sql.NVarChar, req.body.locatie);
      int5Request.query(int5Query, function (error, int5Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea5_simpla", { int5Set: int5Set.recordset });
  
        sql.close();
      });
    });
  });


// // -6-
// // Afișează numele și data festivalurilor, precum și numărul total de participanți pentru fiecare festival:
app.post("/Interogarea6_simpla", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int6Query = `
        SELECT F.NumeFestival, F.DataInceput, F.DataSfarsit, COUNT(PF.ParticipantID) AS NumarParticipanti
        FROM Festivaluri F
        JOIN ParticipantiFestivaluri PF ON F.FestivalID = PF.FestivalID
        GROUP BY F.NumeFestival, F.DataInceput, F.DataSfarsit;
      `;
  
      var int6Request = new sql.Request();
      int6Request.query(int6Query, function (error, int6Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea6_simpla", { int6Set: int6Set.recordset });
  
        sql.close();
      });
    });
  });

// // INTEROGARI COMPLEXE - 4

// // -1-
// // Afișează numele artiștilor care au participat la cel puțin două festivaluri diferite:
app.post("/Interogarea7_complexa", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int7Query = `
      SELECT NumeArtist
      FROM Artisti A
      WHERE EXISTS (
          SELECT 1
          FROM Program P1
          WHERE P1.ArtistID = A.ArtistID
          GROUP BY P1.FestivalID
          HAVING COUNT(*) >= 2
      );
      `;
  
      var int7Request = new sql.Request();
      int7Request.query(int7Query, function (error, int7Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea7_complexa", { int7Set: int7Set.recordset });
  
        sql.close();
      });
    });
  });

// // -2-
// // INTEROGARE COMPLEXA cu camp variabil
// // Afișează festivalurile care au avut cel puțin un participant cu o vârstă mai mică decât o valoare dată:
app.post("/Interogarea8_complexa", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int8Query = `
        SELECT *
        FROM Festivaluri
        WHERE FestivalID IN (
            SELECT F.FestivalID
            FROM Festivaluri F
            JOIN ParticipantiFestivaluri PF ON F.FestivalID = PF.FestivalID
            JOIN Participanti P ON PF.ParticipantID = P.ParticipantID
            WHERE P.Varsta < @varsta
        );
      `;
  
      var int8Request = new sql.Request();
      int8Request.input('varsta', sql.Int, req.body.varsta);
      int8Request.query(int8Query, function (error, int8Set) {
        if (error) {
          console.log("Error querying the database: ", error);
          res.send("Error querying the database: " + error);
          sql.close();
          return;
        }
  
        res.render("Interogarea8_complexa", { int8Set: int8Set.recordset });
  
        sql.close();
      });
    });
  });

// // -3-
// // Afișează participanții care au achiziționat bilete pentru festivalurile la care a cântat "Delia":
app.post("/Interogarea9_complexa", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int9Query = `
        SELECT DISTINCT P.*
        FROM Participanti P
        JOIN ParticipantiFestivaluri PF ON P.ParticipantID = PF.ParticipantID
        WHERE PF.FestivalID IN (
            SELECT FestivalID
            FROM Program
            WHERE ArtistID = (
                SELECT ArtistID
                FROM Artisti
                WHERE NumeArtist = 'Delia'
            )
        );
      `;
  
      var int9Request = new sql.Request();
      int9Request.query(int9Query, function (error, int9Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea9_complexa", { int9Set: int9Set.recordset });
  
        sql.close();
      });
    });
  });

// -4-
//Afișează toti artistii care participa la festivaluri si sunt de nationalitate americana:
app.post("/Interogarea10_complexa", (req, res) => {
    sql.connect(config, function (error) {
      if (error) {
        console.log(error);
        res.send("Error connecting to the database");
        return;
      }
  
      var int10Query = `
        SELECT NumeArtist, GenMuzical, Nationalitate
        FROM Artisti
        WHERE ArtistID IN (
            SELECT DISTINCT P.ArtistID
            FROM Program P
            JOIN Festivaluri F ON P.FestivalID = F.FestivalID
            WHERE F.Locatie IN (
                SELECT Locatie
                FROM Festivaluri
                WHERE Nationalitate = 'americana'
            )
        );
      `;
  
      var int10Request = new sql.Request();
      int10Request.query(int10Query, function (error, int10Set) {
        if (error) {
          console.log(error);
          res.send("Error querying the database");
          sql.close();
          return;
        }
  
        res.render("Interogarea10_complexa", { int10Set: int10Set.recordset });
  
        sql.close();
      });
    });
  });







  










