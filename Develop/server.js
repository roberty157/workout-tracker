const express = require("express");

const logger = require("morgan");
const mongoose = require("mongoose")

const PORT = process.env.PORT || 3000;
const path = require("path");
const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", { useNewUrlParser: true , useUnifiedTopology: true});
/*
app.get("/", (req,res)=>{
    res.sendFile(path.join(__dirname + "./public/index.html"));
});
*/
app.get("/exercise", (req,res)=>{
    res.sendFile(path.join(__dirname + "/public/exercise.html"));
});

app.get("/stats", (req,res)=>{
    res.sendFile(path.join(__dirname + "/public/stats.html"));
});


app.get("/api/workouts/", (req, res) => {
    //console.log(db.Workout.entries);
    db.Workout.aggregate(
        [{
            $addFields: {
                totalDuration: {$sum: "$exercises.duration"}
            }
        },
        ]
    )
    
       
      .then(dbWorkout => {
        console.log(dbWorkout);
        res.json(dbWorkout);
      })
      .catch(err => {
        res.json(err);
      });
});
app.post("/api/workouts/", ({body},res)=>{
    console.log("create workout");
    db.Workout.create(body)
    .then(dbWorkout =>{
        res.json(dbWorkout);
    })
    .catch(err =>{
        res.json(err);
    })
})
//add an exercise
app.put("/api/workouts/:id", (req,res) =>{
    //let id = req.params.id;
    console.log(typeof req.params.id);
    console.log(req.body);
    console.log( mongoose.Types.ObjectId(req.params.id));
    //const exercise = db.Workout.create(req.body);
    //id is params.id

    db.Workout.findByIdAndUpdate(req.params.id,
        {"$push": {"exercises": req.body}},
        {"new": true, "upsert": true},

        )
        .then(dbWorkout =>{
            res.json(dbWorkout);
        })
        .catch(err =>{
            res.json(err);
        })

    /*
    db.Workout.updateOne(
        {
            _id: mongoose.Types.ObjectId(req.params.id)
        },
        {
            $push: { exercise: db.Workout.create(req.body)}
        }
    )
    .then(dbWorkout =>{
        res.json(dbWorkout);
    })
    .catch(err =>{
        res.json(err);
    })
    */
});


//past seven workouts
app.get("/api/workouts/range", (req,res)=>{
    db.Workout.aggregate(
        [{
            $addFields: {
                totalDuration: {$sum: "$exercises.duration"}
            }
        },
        ]
    )
    .limit(7)
    
      .then(dbWorkout => {
        console.log(dbWorkout);
        res.json(dbWorkout);
      })
      .catch(err => {
        res.json(err);
      });
    console.log("getWorkoutsInRange");
});

app.listen(3000,()=>{
    console.log("App running on port 3000!");
});